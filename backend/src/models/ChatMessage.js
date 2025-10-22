const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying of messages between two users
chatMessageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
chatMessageSchema.index({ receiverId: 1, isRead: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
