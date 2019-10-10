const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended : true
}));
app.set ('views', path.join(__dirname));
app.engine ('hbs', exphbs ({ extname : 'hbs' , defaultLayout : '',
 layoutsDir:__dirname + ''}));
app.set('view engine','hbs');

app.get('/home', (req, res) => res.sendFile('home.html', {root : __dirname}));
app.get('/login', (req, res) => res.sendFile('login.html', { root : __dirname}));
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


app.get('/success', (req, res) => res.sendFile('hallReg.html', { root : __dirname}));
app.get('/error', (req, res) => res.send("Log in error"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
})


mongoose.connect('mongodb://localhost/Hall_App', (err)=>{
   if(!err){
       console.log("Mongodb Connected!");
   }else{
       console.log(err);
   }
});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });
let hallSchema = new mongoose.Schema({
        hall : {type : String},
        block : {type : String},
        room : {type : Number}
    });    
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');
const Hall = mongoose.model('Hall', hallSchema);
/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username 
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

app.post('/', 
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success?username='+req.user.username);
  });

app.post('/hallReg', (req, res) => {


    res.send('Hall registration successful')
});  

app.get('/profile', (req, res) => {
    Hall.find((err, docs) => {
        if(!err){
            res.render('profile',{
                list : docs
            });
        } else {
            res.json({'message' : 'Error showing hall data' + err});
        }
    });
  });

app.listen("5000",()=>{
  console.log('Server is listening on port 5000...')
})
