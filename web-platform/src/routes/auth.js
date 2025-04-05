const express = require('express');
const passport = require('passport');
const router = express.Router();
const { googleCallback, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  googleCallback
);

// Get current user route (protected)
router.get('/me', auth, getCurrentUser);

module.exports = router;
