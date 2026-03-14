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
        // 1. Find the file and include the parent folder
        const file = await prisma.uploads.findUnique({
            where: { id: parseInt(fileId) },
            include: { folder: true }
        });

        // 2. Security Check: Does the file's folder match the shareId?
        // This prevents guests from downloading files using random IDs
        if (!file || file.folder.shareId !== shareId) {
            return res.status(403).send("Unauthorized access.");
        }

        // 3. Expiration Check
        if (file.folder.expiresAt && new Date() > file.folder.expiresAt) {
            return res.status(410).send("Share link expired.");
        }

        // 4. Send the file
        // Ensure file.path is the absolute path on your Arch system
        res.download(file.path, file.filename);

    } catch (err) {
        console.error("Download Error:", err);
        res.status(500).send("Could not process download.");
    }
}

module.exports = {
    viewSharedFolder,
    publicDownload
};