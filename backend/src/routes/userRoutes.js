const express = require('express');
const {
  getAllSeniors,
  searchSeniors,
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
} = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes

router.get('/seniors', getAllSeniors);
router.get('/:userId', getUserProfile);

// Protected routes
router.put('/profile', isAuthenticated, validateProfileUpdate, updateProfile);
router.post(
  '/profile/picture',
  isAuthenticated,
  upload.single('profilePicture'),
  uploadProfilePicture
);

module.exports = router;
