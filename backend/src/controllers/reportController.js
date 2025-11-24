const Report = require('../models/Report');
const User = require('../models/User');

/**
 * @desc    Submit a user report
 * @route   POST /api/reports
 * @access  Private
 */
const submitReport = async (req, res, next) => {
  try {
    const { reportedUserId, reason, description, chatContext } = req.body;
    const reporterId = req.user && req.user._id;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ success: false, message: 'reportedUserId and reason are required' });
    }

    // Prevent reporting yourself
    if (reporterId && reporterId.toString() === reportedUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }

    // Ensure reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ success: false, message: 'Reported user not found' });
    }

    // Create report record
    const report = await Report.create({
      reporterId,
      reportedUserId,
      reason,
      description,
      chatContext: Array.isArray(chatContext) ? chatContext : [],
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully', data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReport,
};
