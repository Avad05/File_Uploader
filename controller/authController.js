const bcrypt = require('bcrypt');
const {prisma}  = require('../lib/prisma');


async function getSignUp(req, res){
      res.render('signUp');
}

async function addUserToDb(req, res){
    const {name, username, password, confirm} = req.body;
    if(password === confirm){
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const userDetails = await prisma.user.create({
            data:{
              email: username,
              name: name,
              password: hashedPassword
            }
        })
        res.redirect('/auth/login');
    }
    catch(err){
      if(err.code === 'P2002'){
        res.send('Email already taken')
      }else{
        res.status(500).send(`An internal error occured ${err}`);
      }
    }
}else{
    res.send('Passwords do not match');
}
}

async function getLoginForm(req, res){
    res.render('login');
}

module.exports = {
    getSignUp,
    addUserToDb,
    getLoginForm
};