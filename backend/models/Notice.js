const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'maintenance', 'fees', 'events', 'emergency', 'academic'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'admins'],
    default: 'all'
  },
  validUntil: {
    type: Date,
    default: null
  },
  attachments: [{
    filename: String,
    url: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notice', noticeSchema);
