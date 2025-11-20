const express = require('express');
const {
  getAllSeniors,
  searchSeniors,
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
} = require('../controllers/userController');
const { isAuthenticated, attachUserFromToken } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes

router.get('/seniors', getAllSeniors);
// Optional auth: attach user if token present so we can show owner-specific fields
router.get('/:userId', attachUserFromToken, getUserProfile);

// Protected routes
router.put('/profile', isAuthenticated, validateProfileUpdate, updateProfile);
router.post(
  '/profile/picture',
  isAuthenticated,
  upload.single('profilePicture'),
  uploadProfilePicture
);

// Remove profile picture
router.delete('/profile/picture', isAuthenticated, removeProfilePicture);

module.exports = router;
