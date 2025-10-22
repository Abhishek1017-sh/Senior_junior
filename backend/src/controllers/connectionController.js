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

    // Check if connection already exists
    const junior = await User.findById(juniorId);
    if (
      junior.connections.includes(seniorId) ||
      senior.connections.includes(juniorId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists',
      });
    }

    // Add connection to both users
    await User.findByIdAndUpdate(juniorId, {
      $addToSet: { connections: seniorId },
    });

    await User.findByIdAndUpdate(seniorId, {
      $addToSet: { connections: juniorId },
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

    // Add connection to both users
    await User.findByIdAndUpdate(seniorId, {
      $addToSet: { connections: juniorId },
    });

    await User.findByIdAndUpdate(juniorId, {
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

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnections,
  removeConnection,
};
