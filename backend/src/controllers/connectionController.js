const User = require('../models/User');

/**
 * @desc    Send connection request to a senior
 * @route   POST /api/connections/request/:seniorId
 * @access  Private
 */
const sendConnectionRequest = async (req, res, next) => {
  try {
    const { seniorId } = req.params;
    const juniorId = req.user._id;

    // Check if senior exists
    const senior = await User.findById(seniorId);

    if (!senior) {
      return res.status(404).json({
        success: false,
        message: 'Senior not found',
      });
    }

    // Check if user is trying to connect with themselves
    if (seniorId === juniorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot connect with yourself',
      });
    }

    // Check if senior has senior or both role
    if (senior.role !== 'senior' && senior.role !== 'both') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a senior',
      });
    }

    // Check if connection already exists or pending
    const junior = await User.findById(juniorId);
    if (
      junior.connections.includes(seniorId) ||
      senior.connections.includes(juniorId) ||
      junior.pendingConnections.includes(seniorId) ||
      senior.pendingConnections.includes(juniorId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists or request pending',
      });
    }

    // Add to senior's pending connections
    await User.findByIdAndUpdate(seniorId, {
      $addToSet: { pendingConnections: juniorId },
    });

    // Add to junior's pending connections as well
    await User.findByIdAndUpdate(juniorId, {
      $addToSet: { pendingConnections: seniorId },
    });

    res.status(200).json({
      success: true,
      message: 'Connection request sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept connection request (same as send in this simplified version)
 * @route   POST /api/connections/accept/:juniorId
 * @access  Private (Senior only)
 */
const acceptConnectionRequest = async (req, res, next) => {
  try {
    const { juniorId } = req.params;
    const seniorId = req.user._id;

    // Check if junior exists
    const junior = await User.findById(juniorId);

    if (!junior) {
      return res.status(404).json({
        success: false,
        message: 'Junior not found',
      });
    }

    // Check if connection already exists
    const senior = await User.findById(seniorId);
    if (senior.connections.includes(juniorId)) {
      return res.status(400).json({
        success: false,
        message: 'Connection already accepted',
      });
    }

    // Check if request is pending
    if (!senior.pendingConnections.includes(juniorId)) {
      return res.status(400).json({
        success: false,
        message: 'No pending connection request from this user',
      });
    }

    // Remove from pending and add to connections
    await User.findByIdAndUpdate(seniorId, {
      $pull: { pendingConnections: juniorId },
      $addToSet: { connections: juniorId },
    });

    await User.findByIdAndUpdate(juniorId, {
      $pull: { pendingConnections: seniorId },
      $addToSet: { connections: seniorId },
    });

    res.status(200).json({
      success: true,
      message: 'Connection accepted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all connections for logged-in user
 * @route   GET /api/connections
 * @access  Private
 */
const getConnections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'username email profile role seniorProfile')
      .select('connections');

    res.status(200).json({
      success: true,
      data: user.connections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a connection
 * @route   DELETE /api/connections/:connectionId
 * @access  Private
 */
const removeConnection = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user._id;

    // Remove connection from both users
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: connectionId },
    });

    await User.findByIdAndUpdate(connectionId, {
      $pull: { connections: userId },
    });

    res.status(200).json({
      success: true,
      message: 'Connection removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject connection request
 * @route   POST /api/connections/reject/:juniorId
 * @access  Private (Senior only)
 */
const rejectConnectionRequest = async (req, res, next) => {
  try {
    const { juniorId } = req.params;
    const seniorId = req.user._id;

    // Check if junior exists
    const junior = await User.findById(juniorId);

    if (!junior) {
      return res.status(404).json({
        success: false,
        message: 'Junior not found',
      });
    }

    // Check if request is pending
    const senior = await User.findById(seniorId);
    if (!senior.pendingConnections.includes(juniorId)) {
      return res.status(400).json({
        success: false,
        message: 'No pending connection request from this user',
      });
    }

    // Remove from pending connections
    await User.findByIdAndUpdate(seniorId, {
      $pull: { pendingConnections: juniorId },
    });

    // Also remove from junior's pending connections
    await User.findByIdAndUpdate(juniorId, {
      $pull: { pendingConnections: seniorId },
    });

    res.status(200).json({
      success: true,
      message: 'Connection request rejected',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending connection requests for logged-in user
 * @route   GET /api/connections/pending
 * @access  Private
 */
const getPendingConnections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('pendingConnections', 'username email profile role')
      .select('pendingConnections');

    res.status(200).json({
      success: true,
      data: user.pendingConnections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get count of pending connection requests for logged-in user
 * @route   GET /api/connections/pending/count
 * @access  Private
 */
const getPendingConnectionsCount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('pendingConnections');

    res.status(200).json({
      success: true,
      count: user.pendingConnections.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnections,
  getPendingConnections,
  getPendingConnectionsCount,
  removeConnection,
};
