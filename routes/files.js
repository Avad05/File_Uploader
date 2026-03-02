const Router = require('express');
fileRouter = Router();
const fileController = require('../controller/filesController');
const ensureAuthenticated = require('../middleware/auth');

fileRouter.get('/user', ensureAuthenticated, fileController.userDashboard);
fileRouter.post('/user', ensureAuthenticated, fileController.upload.single('fileSelect'), fileController.uploadFile);
module.exports = fileRouter;