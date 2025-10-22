const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  seniorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Senior ID is required'],
  },
  juniorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Junior ID is required'],
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 15,
    default: 60, // Default 60 minutes
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  meetingLink: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
sessionSchema.index({ seniorId: 1, scheduledTime: 1 });
sessionSchema.index({ juniorId: 1, scheduledTime: 1 });
sessionSchema.index({ status: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
