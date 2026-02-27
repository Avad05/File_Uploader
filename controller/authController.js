const bcrypt = require('bcrypt');
const { prisma } = require('../lib/prisma');


async function getSignUp(req, res){
      res.render('signUp');
}

async function addUserToDb(req, res){
    const {name, username, password} = req.body;
    try{
        const userDetails = await prisma.user.create({
            data:{
              
            }
        })
    }
    catch{

    }
}

module.exports = {getSignUp};