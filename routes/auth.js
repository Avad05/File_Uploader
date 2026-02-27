const {Router} = require('express');
const authRouter = Router();
const passport = require('../config/passport.js');
const authController = require('../controller/authController.js');

authRouter.get('/sign-up', authController.getSignUp);

module.exports = authRouter;