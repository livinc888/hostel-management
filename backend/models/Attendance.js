const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'leave'],
    required: [true, 'Status is required']
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  remarks: {
    type: String,
    maxlength: [200, 'Remarks cannot exceed 200 characters']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function(next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceDate = new Date(this.date);
  attendanceDate.setHours(0, 0, 0, 0);
  
  if (attendanceDate > today) {
    next(new Error('Cannot mark attendance for future dates'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
