const { Passport } = require('passport');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
   usernameField: 'username',
   passwordField: 'password',
   passReqToCallback: true
}, async (req, username, password, done) => {
   console.log(req.body);
   const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
   if (rows.length > 0) {
      const user = rows[0];
      //   const validPassword = await helpers.logueo(password, user.password);
      const validPassword = await (password, user.password);
      if (validPassword) {
         done(null, user, req.flash('success', 'Welcome' + " " + user.username));
      } else {
         done(null, false, req.flash('message', 'incorrect password'));
      }
   } else {
      return done(null, false, req.flash('message', 'El usuario no Existe'));
   }
}));

passport.use('local.signup', new LocalStrategy({
   usernameField: 'username',
   passwordField: 'password',
   passReqToCallback: true
}, async (req, username, password, done) => {
   console.log(req.body);
   console.log("username:", username, " Password: ", password);
   const { fullname } = req.body;
   const newUser = {
      username,
      password,
      fullname
   };

   const rows = await pool.query('SELECT * FROM users');
   console.log("Rows users table: ",rows.length);
   var a = 0;

   if (rows.length > 0) {   
      for (i = 0; i < rows.length; i++) {
         var x = [rows[i].username].toString().toLowerCase();
         var y = newUser.username.toString().toLowerCase();
         
         if (x === y) {
            a++;
         }
      }
   }

   if (a === 0) {
      const result = await pool.query('INSERT INTO users SET ?', [newUser]);
      newUser.id = result.insertId;
      return done(null, newUser);
   }
   else {
      done(null, false, req.flash('message', 'ingrese otro usuario, este ya esta en uso'));
   }
   
}));

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
   const rows = await pool.query('SELECT * FROM users where id = ?', [id]);
   done(null, rows[0]);
}); 