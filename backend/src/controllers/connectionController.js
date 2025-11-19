const User = require('../models/User');

/**
 * @desc    Send connection request to a senior
 * @route   POST /api/connections/request/:seniorId
 * @access  Private
 */
const sendConnectionRequest = async (req, res, next) => {
  try {
    const { seniorId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const juniorId = String(req.user._id || '');
    if (!seniorId) {
      return res.status(400).json({ success: false, message: 'Senior ID missing' });
    }

    if (seniorId === juniorId) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
    }

    const senior = await User.findById(seniorId);
    if (!senior) {
      console.warn(`withdrawConnectionRequest: senior not found (seniorId=${seniorId}, juniorId=${juniorId})`);

      // Fallback: try to remove juniorId from any pending lists (this means junior wanted to withdraw
      // but senior might have been deleted or we have inconsistent state). This is a heavy-handed cleanup
      // but ensures UI won't show pending requests forever.
      const cleanup = await User.updateMany(
        { pendingConnections: juniorId },
        { $pull: { pendingConnections: juniorId } }
      );
      if (cleanup.modifiedCount > 0) {
        console.log(`withdrawConnectionRequest: fallback removed juniorId from ${cleanup.modifiedCount} users`);
        return res.status(200).json({ success: true, message: 'Connection request withdrawn (fallback)' });
      }

      return res.status(404).json({ success: false, message: 'Senior not found' });
    }

    if (senior.role !== 'senior' && senior.role !== 'both') {
      return res.status(400).json({ success: false, message: 'This user is not a senior' });
    }

    const junior = await User.findById(juniorId);
    if (!junior) {
      return res.status(404).json({ success: false, message: 'Junior not found' });
    }

    // use string comparison to be safe
    const seniorConnected = (junior.connections || []).some(c => String(c) === String(seniorId));
    const juniorConnected = (senior.connections || []).some(c => String(c) === String(juniorId));
    if (seniorConnected || juniorConnected) {
      return res.status(400).json({ success: false, message: 'Connection already exists' });
    }

    const pendingExists = (senior.pendingConnections || []).some(c => String(c) === String(juniorId));
    if (pendingExists) {
      return res.status(400).json({ success: false, message: 'Connection request already sent' });
    }

    await User.findByIdAndUpdate(seniorId, { $addToSet: { pendingConnections: juniorId } });

    res.status(200).json({ success: true, message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Error in sendConnectionRequest:', error);
    next(error);
  }
};

/**
 * @desc    Accept connection request (Senior only)
 * @route   POST /api/connections/accept/:juniorId
 * @access  Private (Senior only)
 */
const acceptConnectionRequest = async (req, res, next) => {
  try {
    const { juniorId } = req.params;
    const seniorId = req.user._id;

    // FIX: Check that senior is not the junior (can't accept own request)
    if (juniorId === seniorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot accept your own connection request',
      });
    }

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

    // FIX: Check that SENIOR has the junior's request in THEIR pending list
    if (!senior.pendingConnections.includes(juniorId)) {
      return res.status(400).json({
        success: false,
        message: 'No pending connection request from this user',
      });
    }

    // Remove from senior's pending and add to both connections
    await User.findByIdAndUpdate(seniorId, {
      $pull: { pendingConnections: juniorId },
      $addToSet: { connections: juniorId },
    });

    // FIX: Add to junior's connections as well (symmetric connection)
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

/**
 * @desc    Reject connection request
 * @route   POST /api/connections/reject/:juniorId
 * @access  Private (Senior only)
 */
const rejectConnectionRequest = async (req, res, next) => {
  try {
    const { juniorId } = req.params;
    const seniorId = req.user._id;

    // FIX: Check that senior is not the junior
    if (juniorId === seniorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot reject your own connection request',
      });
    }

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

    // FIX: Only remove from SENIOR's pending connections
    // Junior never had it in their list
    await User.findByIdAndUpdate(seniorId, {
      $pull: { pendingConnections: juniorId },
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
 * @desc    Withdraw/cancel connection request (Junior) - remove juniorId from senior's pending list
 * @route   DELETE /api/connections/withdraw/:seniorId
 * @access  Private
 */
const withdrawConnectionRequest = async (req, res, next) => {
  try {
    const { seniorId } = req.params;
    const juniorId = req.user._id;

    if (!seniorId) {
      return res.status(400).json({ success: false, message: 'Senior ID missing' });
    }

    // Senior must exist
    const senior = await User.findById(seniorId);
    if (!senior) {
      return res.status(404).json({ success: false, message: 'Senior not found' });
    }

    // Check that junior actually has a pending request in senior.pendingConnections
    if (!senior.pendingConnections.some(c => String(c) === String(juniorId))) {
      console.warn(`withdrawConnectionRequest: no pending request (seniorId=${seniorId}, juniorId=${juniorId})`);

      // Attempt a targeted cleanup on any other users who may have this junior in pending
      const cleanup2 = await User.updateMany(
        { pendingConnections: juniorId },
        { $pull: { pendingConnections: juniorId } }
      );
      if (cleanup2.modifiedCount > 0) {
        console.log(`withdrawConnectionRequest: cleanup removed juniorId from ${cleanup2.modifiedCount} users`);
        return res.status(200).json({ success: true, message: 'Connection request withdrawn (cleanup)' });
      }

      return res.status(400).json({ success: false, message: 'No pending connection request to withdraw' });
    }

    await User.findByIdAndUpdate(seniorId, { $pull: { pendingConnections: juniorId } });
    console.log(`withdrawConnectionRequest: withdrawn (seniorId=${seniorId}, juniorId=${juniorId})`);

    res.status(200).json({ success: true, message: 'Connection request withdrawn' });
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
  withdrawConnectionRequest,
};
