require('dotenv').config();
const express = require('express');
const path = require('node:path');
const session = require('express-session');
const passport = require('passport');
const {PrismaSessionStore} = require('@quixo3/prisma-session-store');
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const fileRouter = require('./routes/files');
//const shareFolder = require('./routes/pubic');
const folderRouter = require('./routes/folders');
const {prisma} = require('./lib/prisma');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: false}));
app.use(express.static('public'))
console.log("Testing prisma instance:", prisma.session ? "Found session model" : "Session model NOT found");
app.use(
  session({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
        modelName: 'session'
      }
    )
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/', mainRouter);
app.use('/auth', authRouter);
app.use('/files', fileRouter);
app.use('/folder', folderRouter);
//app.use('/share', shareFolder);
app.use((req, res) => {
    res.status(404).render('404', { 
        title: "Page Not Found",
        user: req.user 
    });
});

const PORT = process.env.PORT;
app.listen(PORT, ()=>{console.log(`Server running on PORT ${PORT}`)})
