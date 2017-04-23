const express = require('express');
const router  = express.Router();

const passport = require('passport');
const FacebookStrategy = require('passport-facebook');

const User = require('../models/user');

passport.use(
  new FacebookStrategy({
    clientID: '2165833230295755',
    clientSecret: 'd2256f0ffc174d78916cd47d63e66f45',
    callbackURL: 'http://localhost:8000/auth/facebook/callback'
  }, function(accesToken, refreshToken, profile, callback) {
    User.findOne({ facebookId: profile.id }, function (err, user) {
      if (user) {
        callback(null, user);
      } else {
        User
          .create({
            facebookId: profile.id,
          })
          .then((user) => {
            callback(null, user);
          });
      }
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/', (req, res) => res.render('statics/home'));

router.get('/login', (req, res) => res.render('statics/login'));
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function secureRoute(req, res, next) {
  if (!req.session.userId) {
    return req.session.regenerate(() => {
      req.flash('danger', 'You must be logged in.');
      res.redirect('/login');
    });
  }

  return next();
}

const artists = require('../controllers/artists');
router.route('/artists')
  .get(artists.index)
  .post(secureRoute, artists.create);
router.route('/artists/new')
  .get(secureRoute, artists.new);
router.route('/artists/:id')
  .get(artists.show)
  .put(secureRoute, artists.update);
router.route('/artists/:id/edit')
  .get(secureRoute, artists.edit);
router.route('/artists/:id')
  .delete(secureRoute, artists.delete);

module.exports = router;
