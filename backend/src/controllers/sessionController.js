const Session = require('../models/Session');
const User = require('../models/User');

/**
 * @desc    Book a session with a senior
 * @route   POST /api/sessions/book
 * @access  Private
 */
const bookSession = async (req, res, next) => {
  try {
    const { seniorId, topic, scheduledTime, duration, meetingLink, notes } =
      req.body;
    const juniorId = req.user._id;

    // Validate required fields
    if (!seniorId || !topic || !scheduledTime || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide seniorId, topic, scheduledTime, and duration',
      });
    }

    // Check if senior exists
    const senior = await User.findById(seniorId);

    if (!senior) {
      return res.status(404).json({
        success: false,
        message: 'Senior not found',
      });
    }

    // Check if senior has senior or both role
    if (senior.role !== 'senior' && senior.role !== 'both') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a senior',
      });
    }

    // Check if scheduled time is in the future
    if (new Date(scheduledTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future',
      });
    }

    // Create session
    const session = await Session.create({
      seniorId,
      juniorId,
      topic,
      scheduledTime,
      duration,
      meetingLink,
      notes,
    });

    const populatedSession = await Session.findById(session._id)
      .populate('seniorId', 'username email profile')
      .populate('juniorId', 'username email profile');

    res.status(201).json({
      success: true,
      message: 'Session booked successfully',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm a booked session
 * @route   PUT /api/sessions/:sessionId/confirm
 * @access  Private (Senior only)
 */
const confirmSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { meetingLink } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is the senior for this session
    if (session.seniorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to confirm this session',
      });
    }

    // Check if session is already confirmed or completed
    if (session.status === 'confirmed' || session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Session is already ${session.status}`,
      });
    }

    // Update session
    session.status = 'confirmed';
    if (meetingLink) {
      session.meetingLink = meetingLink;
    }

    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('seniorId', 'username email profile')
      .populate('juniorId', 'username email profile');

    res.status(200).json({
      success: true,
      message: 'Session confirmed successfully',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a session
 * @route   PUT /api/sessions/:sessionId/cancel
 * @access  Private
 */
const cancelSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is part of this session
    if (
      session.seniorId.toString() !== req.user._id.toString() &&
      session.juniorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this session',
      });
    }

    // Check if session is already completed or cancelled
    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Session is already ${session.status}`,
      });
    }

    // Update session
    session.status = 'cancelled';
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('seniorId', 'username email profile')
      .populate('juniorId', 'username email profile');

    res.status(200).json({
      success: true,
      message: 'Session cancelled successfully',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sessions for logged-in user
 * @route   GET /api/sessions
 * @access  Private
 */
const getSessions = async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;
    const userId = req.user._id;

    let query = {
      $or: [{ seniorId: userId }, { juniorId: userId }],
    };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.scheduledTime = { $gte: new Date() };
    }

    const sessions = await Session.find(query)
      .populate('seniorId', 'username email profile seniorProfile')
      .populate('juniorId', 'username email profile')
      .sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single session by ID
 * @route   GET /api/sessions/:sessionId
 * @access  Private
 */
const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId)
      .populate('seniorId', 'username email profile seniorProfile')
      .populate('juniorId', 'username email profile');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is part of this session
    if (
      session.seniorId._id.toString() !== req.user._id.toString() &&
      session.juniorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this session',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark session as completed
 * @route   PUT /api/sessions/:sessionId/complete
 * @access  Private (Senior only)
 */
const completeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is the senior for this session
    if (session.seniorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the senior can mark this session as completed',
      });
    }

    // Update session
    session.status = 'completed';
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('seniorId', 'username email profile')
      .populate('juniorId', 'username email profile');

    res.status(200).json({
      success: true,
      message: 'Session marked as completed',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookSession,
  confirmSession,
  cancelSession,
  getSessions,
  getSession,
  completeSession,
};
