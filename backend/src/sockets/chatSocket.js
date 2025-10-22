const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const initializeSocket = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
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

    // Join user to their own room (for direct messaging)
    socket.join(socket.user._id.toString());

    // Handle joining a chat room with another user
    socket.on('join', async ({ recipientId }) => {
      try {
        // Check if recipient exists
        const recipient = await User.findById(recipientId);

        if (!recipient) {
          socket.emit('error', { message: 'Recipient not found' });
          return;
        }

        // Create a unique room ID for the conversation
        const roomId = [socket.user._id.toString(), recipientId]
          .sort()
          .join('_');

        socket.join(roomId);

        // Load chat history
        const messages = await ChatMessage.find({
          $or: [
            { senderId: socket.user._id, receiverId: recipientId },
            { senderId: recipientId, receiverId: socket.user._id },
          ],
        })
          .sort({ timestamp: 1 })
          .limit(50)
          .populate('senderId', 'username profile')
          .populate('receiverId', 'username profile');

        socket.emit('chatHistory', { messages });

        console.log(
          `User ${socket.user.username} joined room with ${recipient.username}`
        );
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ recipientId, message }) => {
      try {
        if (!message || !message.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Check if recipient exists
        const recipient = await User.findById(recipientId);

        if (!recipient) {
          socket.emit('error', { message: 'Recipient not found' });
          return;
        }

        // Save message to database
        const chatMessage = await ChatMessage.create({
          senderId: socket.user._id,
          receiverId: recipientId,
          message: message.trim(),
        });

        // Populate sender and receiver info
        await chatMessage.populate('senderId', 'username profile');
        await chatMessage.populate('receiverId', 'username profile');

        // Create room ID
        const roomId = [socket.user._id.toString(), recipientId]
          .sort()
          .join('_');

        // Emit to the room (both sender and receiver)
        io.to(roomId).emit('newMessage', chatMessage);

        // Also emit to recipient's personal room (if they're online but not in this chat)
        io.to(recipientId).emit('messageNotification', {
          from: socket.user._id,
          message: chatMessage,
        });

        console.log(
          `Message from ${socket.user.username} to ${recipient.username}: ${message}`
        );
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ recipientId }) => {
      const roomId = [socket.user._id.toString(), recipientId].sort().join('_');
      socket.to(roomId).emit('userTyping', {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    // Handle stop typing indicator
    socket.on('stopTyping', ({ recipientId }) => {
      const roomId = [socket.user._id.toString(), recipientId].sort().join('_');
      socket.to(roomId).emit('userStoppedTyping', {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async ({ senderId }) => {
      try {
        await ChatMessage.updateMany(
          {
            senderId: senderId,
            receiverId: socket.user._id,
            isRead: false,
          },
          { isRead: true }
        );

        // Notify the sender that messages were read
        io.to(senderId).emit('messagesRead', {
          readBy: socket.user._id,
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.user._id})`);
    });
  });
};

module.exports = initializeSocket;
