const User = require('../models/User');

/**
 * @desc    Get all seniors (with optional search and filtering)
 * @route   GET /api/users/seniors
 * @access  Public
 */
const getAllSeniors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, skills } = req.query;

    // Base query to only find users who are seniors or both
    const query = {
      role: { $in: ['senior', 'both'] },
    };

    // Dynamically add search and filter conditions if they exist
    if (name) {
      query.$or = [
        { 'profile.firstName': { $regex: name, $options: 'i' } },
        { 'profile.lastName': { $regex: name, $options: 'i' } },
        { username: { $regex: name, $options: 'i' } },
      ];
    }

    if (skills) {
      // Split the comma-separated string of skills into an array
      const skillsArray = skills.split(',');
      // Use $all to find documents that have ALL the specified skills
      query['seniorProfile.skills'] = { $all: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    // Execute the query
    const seniors = await User.find(query)
      .select('-password -socialLogins')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'seniorProfile.averageRating': -1 });

    // Get the total count for pagination
    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: seniors,
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
 * @desc    Get user profile by ID
 * @route   GET /api/users/:userId
 * @access  Public
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -socialLogins')
      .populate('connections', 'username email profile')
      .populate('pendingConnections', 'username email profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Server-side privacy: If the requesting user is not the owner, remove sensitive fields
    let returnUser = user;
    if (!req.user || String(req.user._id) !== String(user._id)) {
      // convert to plain object so we can delete fields safely
      returnUser = user.toObject();
      // Remove email and mask precise location by default to respect privacy
      delete returnUser.email;
      if (returnUser.profile && returnUser.profile.location) {
        const loc = returnUser.profile.location;
        // Simple mask: keep first two characters and replace middle with asterisks
        const show = 2;
        if (loc.length <= show) {
          returnUser.profile.location = '*'.repeat(loc.length);
        } else {
          const middle = '*'.repeat(Math.max(3, loc.length - show));
          returnUser.profile.location = `${loc.slice(0, show)}${middle}`;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: returnUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { profile, seniorProfile, role } = req.body;

    const updateData = {};

    if (profile) {
      updateData.profile = { ...req.user.profile, ...profile };
    }

    if (role && ['junior', 'senior', 'both'].includes(role)) {
      updateData.role = role;
    }

    // Only allow senior profile updates if user is senior or both
    if (seniorProfile && (role === 'senior' || role === 'both' || req.user.role === 'senior' || req.user.role === 'both')) {
      updateData.seniorProfile = { ...req.user.seniorProfile, ...seniorProfile };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -socialLogins');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/users/profile/picture
 * @access  Private
 */
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Construct file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${
      req.file.filename
    }`;

    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.profilePictureUrl': fileUrl },
      { new: true }
    ).select('-password -socialLogins');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePictureUrl: fileUrl,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove profile picture
 * @route   DELETE /api/users/profile/picture
 * @access  Private
 */
const removeProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('profile.profilePictureUrl');
    if (!user || !user.profile || !user.profile.profilePictureUrl) {
      return res.status(400).json({ success: false, message: 'No profile picture found' });
    }

    // Attempt to delete the file from uploads folder
    try {
      const path = require('path');
      const fs = require('fs');
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      const parts = user.profile.profilePictureUrl.split('/uploads/');
      const filename = parts.length > 1 ? parts[1] : path.basename(user.profile.profilePictureUrl);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (delErr) {
      console.warn('Failed to remove file from disk:', delErr.message);
    }

    // Update user doc to clear profile picture
    const updated = await User.findByIdAndUpdate(req.user._id, { 'profile.profilePictureUrl': null }, { new: true });

    res.status(200).json({ success: true, message: 'Profile picture removed', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSeniors,
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
};
