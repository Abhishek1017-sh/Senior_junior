const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');

/**
 * @desc    Submit a review for a completed session
 * @route   POST /api/reviews
 * @access  Private
 */
const submitReview = async (req, res, next) => {
  try {
    const { sessionId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Validate required fields
    if (!sessionId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sessionId and rating',
      });
    }

    // Check if session exists
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

 
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed sessions',
      });
    }

    // Check if user is part of the session
    if (
      session.seniorId.toString() !== reviewerId.toString() &&
      session.juniorId.toString() !== reviewerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this session',
      });
    }

    // Determine reviewee
    const revieweeId =
      session.seniorId.toString() === reviewerId.toString()
        ? session.juniorId
        : session.seniorId;

    // Check if review already exists
    const existingReview = await Review.findOne({
      sessionId,
      reviewerId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this session',
      });
    }

    // Create review
    const review = await Review.create({
      sessionId,
      reviewerId,
      revieweeId,
      rating,
      comment,
    });

    // Update senior's average rating if reviewee is a senior
    const reviewee = await User.findById(revieweeId);
    if (reviewee.role === 'senior' || reviewee.role === 'both') {
      await updateSeniorAverageRating(revieweeId);
    }

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'username profile')
      .populate('revieweeId', 'username profile')
      .populate('sessionId', 'topic scheduledTime');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific senior
 * @route   GET /api/reviews/senior/:seniorId
 * @access  Public
 */
const getSeniorReviews = async (req, res, next) => {
  try {
    const { seniorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if senior exists
    const senior = await User.findById(seniorId);

    if (!senior) {
      return res.status(404).json({
        success: false,
        message: 'Senior not found',
      });
    }

    // Get reviews
    const reviews = await Review.find({ revieweeId: seniorId })
      .populate('reviewerId', 'username profile')
      .populate('sessionId', 'topic scheduledTime')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Review.countDocuments({ revieweeId: seniorId });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews given by a user
 * @route   GET /api/reviews/my-reviews
 * @access  Private
 */
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewerId: req.user._id })
      .populate('revieweeId', 'username profile')
      .populate('sessionId', 'topic scheduledTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update senior's average rating
 * @param {string} seniorId - Senior user ID
 */
const updateSeniorAverageRating = async (seniorId) => {
  try {
    const reviews = await Review.find({ revieweeId: seniorId });

    if (reviews.length === 0) {
      await User.findByIdAndUpdate(seniorId, {
        'seniorProfile.averageRating': 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(seniorId, {
      'seniorProfile.averageRating': Math.round(averageRating * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
};

module.exports = {
  submitReview,
  getSeniorReviews,
  getMyReviews,
};
