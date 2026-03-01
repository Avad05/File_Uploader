const Router = require('express');
fileRouter = Router();
const fileController = require('../controller/filesController');

fileRouter.get('/user', fileController.userDashboard);
module.exports = fileRouter;