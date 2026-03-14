const { prisma } = require('../lib/prisma');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination:(req, file, cb) =>{
        cb(null, 'public/uploads/');
    },
   filename:(req, file, cb) =>{
    cb(null, Date.now() + '-' + file.originalname);
   }
})
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
        console.log(userFolders)
        res.render('files',{ 
            user: req.user,
            files: userFiles,
            folders: userFolders,
            

    });
    }catch(err){
        res.status(501).send(`Error while fetching files ${err}`);
    }
    
}

async function uploadFile(req, res){
    try{
        const {fileName} = req.body;
        const userId = req.user.id;
        console.log(fileName);
        await prisma.uploads.create({
            data:{
                filename: fileName || req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                userId: req.user.id
            }
        });
        res.redirect(`/files/${userId}/dashboard`);
    }catch(err){
        res.status(500).send(`Upload Error ${err}`);
    }
}

async function deleteFile(req, res){
    const fileid = req.params.fileId;
    const loggedId = req.user.id;
    try{
    const deleteFile = await prisma.uploads.delete({
        where:{
            id: parseInt(fileid)
        }
    })
    res.redirect(`/files/${loggedId}/dashboard`);
}catch(err){
    res.status(502).send(`Deleting Error ${err}`);
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
    
    // 1. Calculate the expiration date based on the days selected
    const days = parseInt(duration);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // 2. Generate a long, unguessable unique ID
    const shareId = crypto.randomUUID();

    try {
        // 3. Update the folder in the DB with the share info
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