const { addDays } = require('date-fns'); 
const {prisma}  = require('../lib/prisma');

// controller/shareController.js

async function viewSharedFolder(req, res){
    const { shareId, subfolderId } = req.params;
    //console.log(shareId);
    console.log(subfolderId);

    try {
        // 1. Find the "Root" shared folder to verify the link is valid
        const sharedRoot = await prisma.folders.findUnique({
            where: { shareId: shareId }
        });

        if (!sharedRoot || (sharedRoot.expiresAt && new Date() > sharedRoot.expiresAt)) {
            return res.status(404).send("Link invalid or expired.");
        }

        // 2. Decide which folder to display
        // If subfolderId exists, show that. Otherwise, show the root.
        const folderToViewId = subfolderId ? parseInt(subfolderId) : sharedRoot.id;

        const currentFolder = await prisma.folders.findUnique({
            where: { id: folderToViewId },
            include: {
                uploads: true,
                children: true
            }
        });

        // 3. Security Check: Ensure the subfolder actually belongs to the shared root
        // (This prevents people from jumping to folders they weren't shared)
        if (subfolderId && currentFolder.userId !== sharedRoot.userId) {
            return res.status(403).send("Unauthorized.");
        }

        res.render('public-view', { 
            folder: currentFolder, 
            shareId: shareId // We pass this so we can keep the link public
        });
        
    } catch (err) {
        res.status(500).send("Server Error");
    }

}

async function publicDownload(req, res) {
    const { shareId, fileId } = req.params;

    try {
        const file = await prisma.uploads.findUnique({
            where: { id: parseInt(fileId) },
            include: { folder: true }
        });

        // Security check
        if (!file || file.folder.shareId !== shareId) return res.status(403).send("Unauthorized");

        // 1. Generate a Signed URL from Supabase (expires in 60 seconds)
        const { data, error } = await supabase.storage
            .from('File_Uploader')
            .createSignedUrl(file.path, 60);

        if (error) throw error;

        // 2. Redirect the guest to the Supabase download link
        res.redirect(data.signedUrl);

    } catch (err) {
        res.status(500).send("Download failed.");
    }
}

module.exports = {
    viewSharedFolder,
    publicDownload
};