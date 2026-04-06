const Leave = require('../models/Leave');
const User = require('../models/User');

const getLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, studentId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (studentId) query.studentId = studentId;

    console.log("LEAVES FROM DB - Query:", query);

    const leaves = await Leave.find(query)
      .populate('studentId', 'name email phone roomId')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(query);

    console.log("LEAVES FROM DB - Results:", {
      found: leaves.length,
      total: total,
      sample: leaves[0]
    });

    res.json({
      leaves,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave application already processed' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();

    if (status === 'rejected') {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('studentId', 'name email phone')
      .populate('approvedBy', 'name');

    res.json({
      message: `Leave application ${status} successfully`,
      leave: updatedLeave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeaveStats = async (req, res) => {
  try {
    const stats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const currentMonthLeaves = await Leave.aggregate([
      {
        $match: {
          fromDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats,
      currentMonthLeaves
    });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLeaves,
  updateLeaveStatus,
  getLeaveStats
};
