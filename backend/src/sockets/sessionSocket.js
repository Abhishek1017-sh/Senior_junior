const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const initializeSessionSocket = (io) => {
  // Middleware for socket authentication (reuse from chat)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);

    // Join user to their own room for notifications
    socket.join(`user_${socket.user._id.toString()}`);

    // FIX: Handle session booking notification
    socket.on('sessionBooked', async ({ seniorId, sessionId, sessionDetails }) => {
      try {
        // Verify the session exists
        const session = await Session.findById(sessionId)
          .populate('juniorId', 'username profile')
          .populate('seniorId', 'username profile');

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Verify the user is the junior who booked
        if (session.juniorId._id.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Send notification ONLY to the senior (not broadcast to all)
        io.to(`user_${seniorId}`).emit('newSessionRequest', {
          sessionId: session._id,
          junior: {
            _id: session.juniorId._id,
            username: session.juniorId.username,
            firstName: session.juniorId.profile.firstName,
            lastName: session.juniorId.profile.lastName,
            profilePicture: session.juniorId.profile.profilePictureUrl,
          },
          topic: session.topic,
          scheduledTime: session.scheduledTime,
          duration: session.duration,
          notes: session.notes,
          status: session.status,
          message: `${session.juniorId.profile.firstName} wants to schedule a session with you!`,
        });

        console.log(
          `Session booking notification sent to senior: ${seniorId}`
        );
      } catch (error) {
        console.error('Error sending session notification:', error);
        socket.emit('error', { message: 'Failed to send notification' });
      }
    });

    // FIX: Handle session acceptance
    socket.on('acceptSession', async ({ sessionId }) => {
      try {
        const session = await Session.findByIdAndUpdate(
          sessionId,
          { status: 'confirmed' },
          { new: true }
        )
          .populate('juniorId', 'username profile')
          .populate('seniorId', 'username profile');

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Verify the user is the senior
        if (session.seniorId._id.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Notify the junior that their session was accepted
        io.to(`user_${session.juniorId._id.toString()}`).emit('sessionAccepted', {
          sessionId: session._id,
          senior: {
            _id: session.seniorId._id,
            username: session.seniorId.username,
            firstName: session.seniorId.profile.firstName,
            lastName: session.seniorId.profile.lastName,
            profilePicture: session.seniorId.profile.profilePictureUrl,
          },
          topic: session.topic,
          scheduledTime: session.scheduledTime,
          duration: session.duration,
          meetingLink: session.meetingLink,
          message: `${session.seniorId.profile.firstName} accepted your session request!`,
        });

        // Notify the senior of their own action
        socket.emit('sessionAcceptedConfirm', {
          sessionId: session._id,
          message: 'Session accepted successfully!',
        });

        console.log(`Session ${sessionId} accepted by senior ${socket.user._id}`);
      } catch (error) {
        console.error('Error accepting session:', error);
        socket.emit('error', { message: 'Failed to accept session' });
      }
    });

    // FIX: Handle session rejection/decline
    socket.on('declineSession', async ({ sessionId, reason }) => {
      try {
        const session = await Session.findByIdAndUpdate(
          sessionId,
          { status: 'cancelled' },
          { new: true }
        )
          .populate('juniorId', 'username profile')
          .populate('seniorId', 'username profile');

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Verify the user is the senior
        if (session.seniorId._id.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Notify the junior that their session was declined
        io.to(`user_${session.juniorId._id.toString()}`).emit('sessionDeclined', {
          sessionId: session._id,
          senior: {
            _id: session.seniorId._id,
            username: session.seniorId.username,
            firstName: session.seniorId.profile.firstName,
            lastName: session.seniorId.profile.lastName,
          },
          reason: reason || 'Senior declined the session',
          message: `${session.seniorId.profile.firstName} declined your session request.`,
        });

        // Notify the senior of their own action
        socket.emit('sessionDeclinedConfirm', {
          sessionId: session._id,
          message: 'Session declined successfully!',
        });

        console.log(`Session ${sessionId} declined by senior ${socket.user._id}`);
      } catch (error) {
        console.error('Error declining session:', error);
        socket.emit('error', { message: 'Failed to decline session' });
      }
    });

    // FIX: Handle senior sending counter-offer message
    socket.on('sendSessionMessage', async ({ sessionId, message }) => {
      try {
        const session = await Session.findById(sessionId)
          .populate('juniorId', 'username profile')
          .populate('seniorId', 'username profile');

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Verify user is part of this session
        const isSenior = session.seniorId._id.toString() === socket.user._id.toString();
        const isJunior = session.juniorId._id.toString() === socket.user._id.toString();

        if (!isSenior && !isJunior) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Send message to the other party
        const recipientId = isSenior ? session.juniorId._id : session.seniorId._id;

        io.to(`user_${recipientId.toString()}`).emit('sessionMessage', {
          sessionId: session._id,
          from: {
            _id: socket.user._id,
            username: socket.user.username,
            firstName: socket.user.profile.firstName,
            lastName: socket.user.profile.lastName,
          },
          message: message,
          timestamp: new Date(),
          senderRole: isSenior ? 'senior' : 'junior',
        });

        console.log(
          `Message sent in session ${sessionId} from ${socket.user.username}`
        );
      } catch (error) {
        console.error('Error sending session message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // FIX: Get pending session requests for a senior
    socket.on('getPendingSessions', async () => {
      try {
        const pendingSessions = await Session.find({
          seniorId: socket.user._id,
          status: 'pending',
        })
          .populate('juniorId', 'username profile')
          .sort({ createdAt: -1 });

        socket.emit('pendingSessionsList', {
          sessions: pendingSessions,
          count: pendingSessions.length,
        });
      } catch (error) {
        console.error('Error fetching pending sessions:', error);
        socket.emit('error', { message: 'Failed to fetch pending sessions' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.user._id})`);
    });
  });
};

module.exports = initializeSessionSocket;
