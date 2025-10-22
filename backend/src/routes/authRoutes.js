const express = require('express');
const passport = require('passport');
const {
  register,
  login,
  getMe,
  oAuthSuccess,
  oAuthFailure,
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validation');

const router = express.Router();

// Regular authentication
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', isAuthenticated, getMe);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/oauth/failure' }),
  oAuthSuccess
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/api/auth/oauth/failure' }),
  oAuthSuccess
);

// OAuth success/failure routes
router.get('/oauth/success', oAuthSuccess);
router.get('/oauth/failure', oAuthFailure);

module.exports = router;
