const { prisma } = require('../lib/prisma');
const multer = require('multer');
const fs = require('fs/promises');
const supabase = require('../lib/supabase');

async function createFolder(req, res) {
  const { folderName, parentId } = req.body;
  
  try {
    await prisma.folders.create({
      data: {
        name: folderName,
        userId: req.user.id,
        parentId: parentId ? parseInt(parentId) : null
      }
    });
    res.redirect(parentId ? `/folder/${parseInt(parentId)}`:`/files/${req.user.id}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not create folder.");
  }
}

async function getFolderContent(req, res) {
    const folderId = parseInt(req.params.folderId);

    if(isNaN(folderId)){
      res.status(400).send('Invalid folder id content.')
    }
    const folder = await prisma.folders.findUnique({
      where: {id: folderId},
      include:{
        uploads:true,
        children:true
      }
    });
    
    if (!folder) {
            return res.status(404).send('Folder not found');
        }

    if(folder.userId !== req.user.id){
      return res.status(403).send('Unauthorised Access');
    }
    res.render('folder', {folderId, files: folder.uploads, folderName: folder.name, user:req.user, subFolders: folder.children});
}

const storage = multer.diskStorage({
    destination:(req, file, cb) =>{
        cb(null, 'public/uploads/');
    },
   filename:(req, file, cb) =>{
    cb(null, Date.now() + '-' + file.originalname);
   }
})
const upload = multer({storage: storage});

async function uploadFileInFolder(req, res) {
    try {
        // 1. Check if file exists
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const folderId = parseInt(req.params.folderId);
        
        // 2. Construct the Supabase Path
        // Using req.file instead of 'file'
        const filePath = `user_${req.user.id}/folder_${folderId}/${Date.now()}_${req.file.originalname}`;

        // 3. UPLOAD TO SUPABASE
        const { data, error } = await supabase.storage
            .from('File_Uploader')
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false // Prevents overwriting existing files
            });

        if (error) throw error;

        // 4. SAVE TO PRISMA
        await prisma.uploads.create({
            data: {
                filename: req.body.fileName || req.file.originalname,
                path: filePath, // Store the Supabase path
                size: req.file.size,
                userId: req.user.id,
                folderId: folderId
            }
        });

        res.redirect(`/folder/${folderId}`);

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).send(`Error Uploading File: ${err.message}`);
    }
}

async function deleteFolder(req, res) {
    const folderId = parseInt(req.params.folderId);

    try {
        // 1. Fetch folder info BEFORE deleting so we know where to go back to
        const folder = await prisma.folders.findUnique({
            where: { id: folderId },
            select: { parentId: true, userId: true }
        });

        if (!folder || folder.userId !== req.user.id) {
            return res.status(403).send("Unauthorized or Folder not found");
        }

        // 2. (Optional) Cleanup physical files in this folder from your Arch drive
        // [Logic to loop through uploads and fs.unlink goes here]

        // 3. Delete from Database
        await prisma.folders.delete({
            where: { id: folderId }
        });

        // 4. Conditional Redirect
        if (folder.parentId) {
            // It was a subfolder, go back to the parent folder
            return res.redirect(`/folder/${folder.parentId}`);
        } else {
            // It was a top-level folder, go back to the dashboard
            return res.redirect(`/files/${req.user.id}/dashboard`);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send("Error deleting folder.");
    }
}
module.exports = {
    createFolder,
    getFolderContent,
    upload,
    uploadFileInFolder,
    deleteFolder
};