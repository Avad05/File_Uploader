const passport = require('passport');
const LocalStratergy = require('passport-local');
const bcrypt = require('bcrypt');
const { prisma }  = require('../lib/prisma.js');

passport.use(
  new LocalStratergy({usernameField: 'email'}, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({where: { email } })     

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await prisma.findUnique({where: { id }});
   // const user = rows[0];
    done(null, user);
  } catch(err) {
    done(err);
  }
});

module.exports = passport;
