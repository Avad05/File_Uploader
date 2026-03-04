const { prisma } = require('../lib/prisma');

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
    res.render('folder');
}

module.exports = {
    createFolder,
    getFolderContent
};