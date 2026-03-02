const Router = require('express');
fileRouter = Router();
const fileController = require('../controller/filesController');
const ensureAuthenticated = require('../middleware/auth');

fileRouter.get('/:userId/dashboard', ensureAuthenticated, fileController.userDashboard);
fileRouter.post('/:userId/dashboard', ensureAuthenticated, fileController.upload.single('fileSelect'), fileController.uploadFile);
fileRouter.post('/delete/:fileId', ensureAuthenticated, fileController.deleteFile);
module.exports = fileRouter;