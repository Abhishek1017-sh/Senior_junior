const express = require('express');
const {
  submitReview,
  getSeniorReviews,
  getMyReviews,
} = require('../controllers/reviewController');
//for authentication
const { isAuthenticated } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/senior/:seniorId', getSeniorReviews);

// Protected routes
router.post('/', isAuthenticated, validateReview, submitReview);
router.get('/my-reviews', isAuthenticated, getMyReviews);

module.exports = router;
