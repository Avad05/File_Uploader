const { prisma } = require('../lib/prisma');
const multer = require('multer');
const path = require('path');

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
    if(urlId !== loggedId){
        return res.status(500).send("Unauthorised Access XDXD");
    }

    try{
        const userFiles = await prisma.uploads.findMany({
            where:{
                userId:loggedId 
            },
            orderBy:{
                createdAt: 'desc'
            }
        })
        res.render('files',{ 
            user: req.user,
            files: userFiles

    });
    }catch(err){
        res.status(501).send(`Error while fetching files ${err}`);
    }
    
}

async function uploadFile(req, res){
    try{
        const {fileName} = req.body;
        console.log(fileName);
        await prisma.uploads.create({
            data:{
                filename: fileName || req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                userId: req.user.id
            }
        });
        res.redirect('/files/user');
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
module.exports = {
    userDashboard,
    uploadFile,
    upload,
    deleteFile
};