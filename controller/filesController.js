const { prisma } = require('../lib/prisma');
const multer = require('multer');
const storage = multer.memoryStorage();
const path = require('path');
const crypto = require('crypto');
const supabase = require('../lib/supabase');

const upload = multer({storage: storage});


async function userDashboard(req, res){
    const urlId = parseInt(req.params.userId);
    const loggedId = req.user.id;

    if(isNaN(urlId)){
        res.status(400).send('Invalid UserId format.');
    }

    if(urlId !== loggedId){
        return res.status(500).send("Unauthorised Access XDXD");
    }

    try{
        const userFiles = await prisma.uploads.findMany({
            where:{
                userId:loggedId,
                folderId: null 
            },
            orderBy:{
                createdAt: 'desc'
            }
        })

        const userFolders = await prisma.folders.findMany({
            where:{
                userId: loggedId,
                parentId: null
            },
            orderBy:{
                createdAt: 'desc'
            }
        })
        
        res.render('files',{ 
            user: req.user,
            files: userFiles,
            folders: userFolders,
            

    });
    }catch(err){
        res.status(501).send(`Error while fetching files ${err}`);
    }
    
}

async function uploadFile(req, res) {
    const file = req.file; 
    const { folderId } = req.body;

   
    const filePath = `user_${req.user.id}/${Date.now()}_${file.originalname}`;

    try {
        // Uploading to Supabase Bucket
        const { data, error } = await supabase.storage
            .from('File_Uploader')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype
            });

        if (error) throw error;

        // Saving the Supabase path to your Prisma DB 
        await prisma.uploads.create({
            data: {
                filename: file.originalname,
                path: filePath, 
                size: file.size,
                folderId: parseInt(folderId),
                userId: req.user.id
            }
        });

        res.redirect(`/files/${req.user.id}/dashboard`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Upload failed ${err}`);
    }
}

async function deleteFile(req, res) {
    const fileId = req.params.fileId;
    const loggedId = req.user.id;

    try {
        // 1. First, FIND the file in Prisma to get its Supabase path
        const file = await prisma.uploads.findUnique({
            where: { id: parseInt(fileId) }
        });

        if (!file) {
            return res.status(404).send("File not found.");
        }

        // 2. DELETE FROM SUPABASE
        const { error: storageError } = await supabase.storage
            .from('File_Uploader')
            .remove([file.path]); // .remove() expects an array of paths

        if (storageError) {
            console.error("Supabase Storage Error:", storageError);
           
        }

        // 3. DELETE FROM PRISMA
        await prisma.uploads.delete({
            where: { id: parseInt(fileId) }
        });

        res.redirect(`/files/${loggedId}/dashboard`);

    } catch (err) {
        console.error("Deletion Error:", err);
        res.status(502).send(`Deleting Error: ${err.message}`);
    }
}

async function downloadFile(req, res){
    try{
       const id = parseInt(req.params.fileId);

       const fileRecord = await prisma.uploads.findUnique({
        where: {id: id}
       });

       if(!fileRecord){
        res.status(402).send('File Not Found in the Database');
       }

       if(fileRecord.userId !== req.user.id){
        res.status(403).send('You are not Authorised to download the files');
       }

       const absolutePath = path.resolve(fileRecord.path);
       res.download(absolutePath, fileRecord.filename, (err) =>{
        if(err){
         res.status(402).send('Download error');
         console.log(err);
         if (!res.headersSent) {
                    res.status(500).send("Could not download the file.");
        }
       }})

    }catch(err){
        res.status(402).send(`Error ${err}`);
    } 

}
async function generateShareLink(req, res) {
    const { folderId, duration } = req.body;
    
    // Calculate the expiration date based on the days selected
    const days = parseInt(duration);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Generate a long unique ID
    const shareId = crypto.randomUUID();

    try {
        //  Update the folder in the DB with the share info
        const updatedFolder = await prisma.folders.update({
            where: { 
                id: parseInt(folderId),
                userId: req.user.id // Security: Ensure the logged-in user owns it
            },
            data: {
                shareId: shareId,
                expiresAt: expiresAt
            }
        });

        // 4. Construct the full URL
        // req.get('host') will be 'localhost:3000' or your production domain
        const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareId}`;

        // 5. Render a success page to show the link to the user
        res.render('share-success', { 
            shareUrl, 
            folderName: updatedFolder.name,
            expiresAt,
            user:req.user
        });

    } catch (err) {
        console.error("Error generating share link:", err);
        res.status(500).send(`Could not generate share link. ${err}`);
    }
}

module.exports = {
    userDashboard,
    uploadFile,
    upload,
    deleteFile,
    downloadFile,
    generateShareLink
};