require('dotenv').config;
const express = require('express');
const path = require('node:path');
const session = require('express-session');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const mainroute = require('./routes/main');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: false}));
app.use(express.static('public'))
app.use(session({ 
  store: new pgSession({
    pool: pool,
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
app.use('/', mainroute);
