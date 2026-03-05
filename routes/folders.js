const Router = require('express')
const folderRouter = Router();
const folderController = require('../controller/folderController');
const ensureAuthenticated = require('../middleware/auth');

folderRouter.post('/create-folder', folderController.createFolder);
folderRouter.get('/:folderId', folderController.getFolderContent);
folderRouter.post('/:folderId', ensureAuthenticated, folderController.upload.single('fileSelect'), folderController.uploadFileInFolder);
module.exports = folderRouter;