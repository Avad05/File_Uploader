const {Router} = require('express');
const authRouter = Router();
const passport = require('../config/passport.js');
const authController = require('../controller/authController.js');

authRouter.get('/sign-up', authController.getSignUp);
authRouter.post('/sign-up', authController.addUserToDb);
authRouter.get('/login', authController.getLoginForm)
authRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) =>{
        if(err) return next(err);
        if(!user) return res.redirect('/auth/login')
        req.logIn(user, (err) =>{
             if(err) return next(err);
             return res.redirect(`/files/${user.id}/dashboard`)
    })
}) (req, res, next);
});
authRouter.get('/logout', authController.logout);
authRouter.get('/check-username', authController.checkUsername);
module.exports = authRouter;