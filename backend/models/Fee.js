const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'cheque', null],
    default: null
  },
  transactionId: {
    type: String,
    default: null,
    required: false
  }
}, {
  timestamps: true
});

feeSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
