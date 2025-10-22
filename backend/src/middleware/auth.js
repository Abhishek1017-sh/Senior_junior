const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes requiring authentication
 */
const isAuthenticated = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to access this resource.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token verification failed.',
    });
  }
};

/**
 * Middleware to check if user has senior role
 */
const isSenior = (req, res, next) => {
  if (req.user && (req.user.role === 'senior' || req.user.role === 'both')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This resource is only available to seniors.',
    });
  }
};

/**
 * Middleware to check if user has junior role
 */
const isJunior = (req, res, next) => {
  if (req.user && (req.user.role === 'junior' || req.user.role === 'both')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This resource is only available to juniors.',
    });
  }
};

module.exports = { isAuthenticated, isSenior, isJunior };
