const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['single', 'double', 'triple', 'four'],
    required: [true, 'Room type is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
    max: 4
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  floor: {
    type: Number,
    required: true,
    min: 1
  },
  block: {
    type: String,
    required: true,
    uppercase: true
  }
}, {
  timestamps: true
});

roomSchema.virtual('availableSpace').get(function() {
  return this.capacity - this.occupants.length;
});

roomSchema.virtual('isFull').get(function() {
  return this.occupants.length >= this.capacity;
});

module.exports = mongoose.model('Room', roomSchema);
