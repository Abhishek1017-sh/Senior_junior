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

// FIX: OAuth routes with proper callback handling
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // FIX: Generate token and redirect to frontend with token
    const { generateToken } = require('../utils/generateToken');
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // FIX: Generate token and redirect to frontend with token
    const { generateToken } = require('../utils/generateToken');
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

module.exports = router;
