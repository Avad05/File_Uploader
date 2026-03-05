const { prisma } = require('../lib/prisma');
const multer = require('multer');

async function createFolder(req, res) {
  const { folderName } = req.body;
  
  try {
    await prisma.folders.create({
      data: {
        name: folderName,
        userId: req.user.id // Ensure Passport is protecting this route
      }
    });
    res.redirect(`/files/${req.user.id}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not create folder.");
  }
}

async function getFolderContent(req, res) {
    const folderId = parseInt(req.params.folderId);
    const folder = await prisma.folders.findUnique({
      where: {id: folderId},
      include:{
        uploads:true
      }
    });
    if (!folder) {
            return res.status(404).send('Folder not found');
        }

    if(folder.userId !== req.user.id){
      return res.status(403).send('Unauthorised Access');
    }
    res.render('folder', {folderId, files: folder.uploads, folderName: folder.name, user:req.user});
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

async function uploadFileInFolder (req, res){
  try{
    const {fileName} = req.body;
    await prisma.uploads.create({
      data:{
        filename: fileName || req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        userId: req.user.id,
        folderId: parseInt(req.params.folderId)
      }
    })
    res.redirect(`/folder/${parseInt(req.params.folderId)}`);
  }catch(err){
    res.status(510).send(`Error Uploading File ${err}`);
  }
}
module.exports = {
    createFolder,
    getFolderContent,
    upload,
    uploadFileInFolder

};