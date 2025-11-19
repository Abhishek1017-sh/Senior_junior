const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  seniorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  juniorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
  },
  meetingLink: {
    type: String,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  // FIX: Add cancellation reason and who cancelled
  cancellationReason: {
    type: String,
    default: null,
  },
  cancelledBy: {
    type: String,
    enum: ['senior', 'junior'],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// Index for efficient querying
sessionSchema.index({ seniorId: 1, scheduledTime: 1 });
sessionSchema.index({ juniorId: 1, scheduledTime: 1 });
sessionSchema.index({ status: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
