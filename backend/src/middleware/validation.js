const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules for user registration
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['junior', 'senior', 'both'])
    .withMessage('Role must be junior, senior, or both'),
  validate,
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Validation rules for session booking
const validateSessionBooking = [
  body('seniorId')
    .notEmpty()
    .withMessage('Senior ID is required')
    .isMongoId()
    .withMessage('Invalid senior ID'),
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ max: 200 })
    .withMessage('Topic must not exceed 200 characters'),
  body('scheduledTime')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('meetingLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  validate,
];

// Validation rules for review submission
const validateReview = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  validate,
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('role')
    .optional()
    .isIn(['junior', 'senior', 'both'])
    .withMessage('Role must be junior, senior, or both'),
  body('seniorProfile.hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  validate,
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateSessionBooking,
  validateReview,
  validateProfileUpdate,
};
