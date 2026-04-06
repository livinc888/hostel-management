const Fee = require('../models/Fee');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const getFeeReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};

    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const feeStats = await Fee.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyTrend = await Fee.aggregate([
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalAmount: { $sum: '$amount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topDefaulters = await Fee.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$studentId',
          totalPending: { $sum: '$amount' },
          pendingFees: { $sum: 1 }
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
      { $sort: { totalPending: -1 } },
      { $limit: 10 },
      {
        $project: {
          studentName: '$student.name',
          studentEmail: '$student.email',
          totalPending: 1,
          pendingFees: 1
        }
      }
    ]);

    res.json({
      feeStats,
      monthlyTrend,
      topDefaulters
    });
  } catch (error) {
    console.error('Get fee report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOccupancyReport = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const availableRooms = totalRooms - occupiedRooms;
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

    const roomTypeStats = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          occupied: {
            $sum: {
              $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
            }
          },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          },
          maintenance: {
            $sum: {
              $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const blockStats = await Room.aggregate([
      {
        $group: {
          _id: '$block',
          totalRooms: { $sum: 1 },
          occupiedRooms: {
            $sum: {
              $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
            }
          },
          totalCapacity: { $sum: '$capacity' },
          occupiedBeds: { $sum: { $size: '$occupants' } }
        }
      },
      {
        $project: {
          block: '$_id',
          totalRooms: 1,
          occupiedRooms: 1,
          totalCapacity: 1,
          occupiedBeds: 1,
          occupancyRate: {
            $multiply: [
              { $divide: ['$occupiedBeds', '$totalCapacity'] },
              100
            ]
          }
        }
      },
      { $sort: { block: 1 } }
    ]);

    const floorStats = await Room.aggregate([
      {
        $group: {
          _id: '$floor',
          totalRooms: { $sum: 1 },
          occupiedRooms: {
            $sum: {
              $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
            }
          },
          totalCapacity: { $sum: '$capacity' },
          occupiedBeds: { $sum: { $size: '$occupants' } }
        }
      },
      {
        $project: {
          floor: '$_id',
          totalRooms: 1,
          occupiedRooms: 1,
          totalCapacity: 1,
          occupiedBeds: 1,
          occupancyRate: {
            $multiply: [
              { $divide: ['$occupiedBeds', '$totalCapacity'] },
              100
            ]
          }
        }
      },
      { $sort: { floor: 1 } }
    ]);

    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
      roomTypeStats,
      blockStats,
      floorStats
    });
  } catch (error) {
    console.error('Get occupancy report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getComplaintReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateMatch = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateMatch = {
        createdAt: { $gte: startDate, $lte: endDate }
      };
    }

    const statusStats = await Complaint.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Complaint.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyTrend = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const avgResolutionTime = await Complaint.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
      {
        $project: {
          resolutionDays: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$resolutionDays' }
        }
      }
    ]);

    res.json({
      statusStats,
      categoryStats,
      priorityStats,
      monthlyTrend,
      avgResolutionTime: avgResolutionTime.length > 0 ? avgResolutionTime[0].avgDays : 0
    });
  } catch (error) {
    console.error('Get complaint report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const studentsWithRoom = await User.countDocuments({ role: 'student', roomId: { $ne: null } });
    const studentsWithoutRoom = totalStudents - studentsWithRoom;

    const studentsByBlock = await User.aggregate([
      { $match: { role: 'student', roomId: { $ne: null } } },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $group: {
          _id: '$room.block',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const newStudents = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalStudents,
      studentsWithRoom,
      studentsWithoutRoom,
      accommodationRate: totalStudents > 0 ? (studentsWithRoom / totalStudents) * 100 : 0,
      studentsByBlock,
      newStudents
    });
  } catch (error) {
    console.error('Get student report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFeeReport,
  getOccupancyReport,
  getComplaintReport,
  getStudentReport
};
