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
    res.render('files');
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
module.exports = {
    userDashboard,
    uploadFile,
    upload
};