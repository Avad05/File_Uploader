const {Router} = require('express');
const mainRouter = Router();
const mainController = require('../controller/mainController');
 
mainRouter.get("/", mainController.getHome);
module.exports = mainRouter;
