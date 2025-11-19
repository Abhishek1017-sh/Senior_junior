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

// Placeholder routes (actual controller implementation needed)
router.post('/', isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Review submitted successfully',
  });
});

router.get('/senior/:seniorId', (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
  });
});

module.exports = router;
