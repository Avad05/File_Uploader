require('dotenv').config();
const express = require('express');
const path = require('node:path');
const session = require('express-session');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const prisma = require('./lib/prisma');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: false}));
app.use(express.static('public'))
app.use(session({ 
  store: new pgSession({
    pool: prisma,
    tableName: 'session' 
  }),
  secret: process.env.SESSION_SECRET || "cats",
  resave: false, 
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', mainRouter);
app.use('/auth', authRouter);

const PORT = process.env.PORT;
app.listen(PORT, ()=>{console.log(`Server running on PORT ${PORT}`)})
