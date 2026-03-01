const {Router} = require('express');
const authRouter = Router();
const passport = require('../config/passport.js');
const authController = require('../controller/authController.js');

authRouter.get('/sign-up', authController.getSignUp);
authRouter.post('/sign-up', authController.addUserToDb);
authRouter.get('/login', authController.getLoginForm)
authRouter.post('/login', passport.authenticate('local', {
    successRedirect: '/files',
    failureRedirect: '/login'
}));
module.exports = authRouter;