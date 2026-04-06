const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getAttendance = async (req, res) => {
  try {
    const { date, month, year, status } = req.query;
    const query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status) query.status = status;

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name email phone roomId')
      .populate('markedBy', 'name')
      .sort({ date: -1, studentId: 1 });

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ message: 'Attendance records are required' });
    }

    const results = [];
    const errors = [];

    for (const record of attendanceRecords) {
      try {
        const { studentId, date, status, remarks, checkInTime, checkOutTime } = record;

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
          studentId,
          date: attendanceDate
        });

        let attendance;
        if (existingAttendance) {
          existingAttendance.status = status;
          existingAttendance.remarks = remarks;
          existingAttendance.checkInTime = checkInTime ? new Date(checkInTime) : null;
          existingAttendance.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;
          existingAttendance.markedBy = req.user.id;
          attendance = await existingAttendance.save();
        } else {
          attendance = new Attendance({
            studentId,
            date: attendanceDate,
            status,
            remarks,
            checkInTime: checkInTime ? new Date(checkInTime) : null,
            checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
            markedBy: req.user.id
          });
          attendance = await attendance.save();
        }

        const populatedAttendance = await Attendance.findById(attendance._id)
          .populate('studentId', 'name email phone')
          .populate('markedBy', 'name');

        results.push(populatedAttendance);
      } catch (error) {
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    res.json({
      message: `Processed ${results.length} attendance records`,
      marked: results.length,
      errors: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const { month, year, studentId } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let matchStage = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (studentId) {
      matchStage.studentId = new mongoose.Types.ObjectId(studentId);
    }

    const report = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          leave: {
            $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          studentName: '$student.name',
          studentEmail: '$student.email',
          totalDays: 1,
          present: 1,
          absent: 1,
          late: 1,
          leave: 1,
          attendancePercentage: {
            $multiply: [
              { $divide: ['$present', '$totalDays'] },
              100
            ]
          }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  getAttendanceReport
};
