const { prisma } = require('../lib/prisma');

async function userDashboard(req, res){
    res.render('/files');
}

module.exports = {userDashboard};