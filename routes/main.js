const {Router} = require('express');
const mainRouter = Router();
const mainController = require('../controller/mainController');
const publicController = require('../controller/shareController');
 
mainRouter.get("/", mainController.getHome);
// This route handles both the root shared folder and any subfolder inside it
mainRouter.get('/share/:shareId', publicController.viewSharedFolder);
mainRouter.get('/share/:shareId/:subfolderId', publicController.viewSharedFolder);
mainRouter.get('/share/download/:shareId/:fileId', publicController.publicDownload);
module.exports = mainRouter;
