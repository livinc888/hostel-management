const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [300, 'Reason cannot exceed 300 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  contactDuringLeave: {
    type: String,
    required: [true, 'Contact number during leave is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

leaveSchema.pre('save', function(next) {
  if (this.toDate < this.fromDate) {
    next(new Error('To date must be after from date'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Leave', leaveSchema);
