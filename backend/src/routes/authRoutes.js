const express = require('express');
const {
  register,
  login,
  getMe,
  oAuthSuccess,
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const passport = require('passport');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', isAuthenticated, getMe);

// OAuth: only register Google routes when strategy is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Generate token and redirect to frontend with token
      const { generateToken } = require('../utils/generateToken');
      const token = generateToken(req.user._id);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  );
} else {
  // Helpful error when routes are called but provider isn't configured
  router.get('/google', (req, res) => {
    res.status(501).json({ success: false, message: 'Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
  });
  router.get('/google/callback', (req, res) => {
    res.status(501).json({ success: false, message: 'Google OAuth callback is not available because Google OAuth is not configured.' });
  });
}

// OAuth: only register GitHub routes when strategy is configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
      // Generate token and redirect to frontend with token
      const { generateToken } = require('../utils/generateToken');
      const token = generateToken(req.user._id);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  );
} else {
  router.get('/github', (req, res) => {
    res.status(501).json({ success: false, message: 'GitHub OAuth is not configured on this server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.' });
  });

  router.get('/github/callback', (req, res) => {
    res.status(501).json({ success: false, message: 'GitHub OAuth callback is not available because GitHub OAuth is not configured.' });
  });
}

module.exports = router;
