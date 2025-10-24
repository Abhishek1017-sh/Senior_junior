const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get user's chat conversations
router.get('/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unique users that the current user has exchanged messages with
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$senderId', userId] },
              then: '$receiverId',
              else: '$senderId'
            }
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          _id: '$_id',
          participant: {
            _id: '$participant._id',
            username: '$participant.username',
            profile: '$participant.profile'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.message',
            createdAt: '$lastMessage.timestamp',
            senderId: '$lastMessage.senderId'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a specific conversation
router.get('/messages/:recipientId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId, receiverId: recipientId },
        { senderId: recipientId, receiverId: userId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('senderId', 'username profile')
    .populate('receiverId', 'username profile');

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        senderId: recipientId,
        receiverId: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/messages', isAuthenticated, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const message = await ChatMessage.create({
      senderId,
      receiverId: recipientId,
      message: content.trim()
    });

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('senderId', 'username profile')
      .populate('receiverId', 'username profile');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark messages as read
router.put('/messages/read/:senderId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    await ChatMessage.updateMany(
      {
        senderId,
        receiverId: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

module.exports = router;