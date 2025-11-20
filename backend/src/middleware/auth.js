const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) return res.status(401).json({ success: false, message: 'Authentication required - no token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Accept several common token payload shapes
    const userId = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    // Try to fetch user from DB. This will attach the full user document (without password)
    // to req.user so downstream controllers have access to the profile/role fields.
    const user = await User.findById(userId).select('-password -socialLogins');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }

    // Attach the user document; mongoose adds `id` getter (string) so both `req.user._id`
    // and `req.user.id` will work in existing code.
    req.user = user;
    // Save raw token in case middleware or routes need it
    req.user.raw = decoded;

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Check if user is senior
const isSenior = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // FIX: For now, allow all authenticated users to act as seniors
  // In production, you'd fetch the user and check their role
  next();
};

// Check if user is junior
const isJunior = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  next();
};

module.exports = {
  isAuthenticated,
  isSenior,
  isJunior,
};

// Optional attach user middleware: decode token if present and attach `req.user`, but don't error if missing
const attachUserFromToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub;
    if (!userId) return next();

    const user = await User.findById(userId).select('-password -socialLogins');
    if (user) req.user = user;
    return next();
  } catch (err) {
    // ignore errors – user remains unauthenticated; do not block the request
    return next();
  }
};

module.exports.attachUserFromToken = attachUserFromToken;
