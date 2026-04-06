const User = require('../models/User');
const Room = require('../models/Room');
const Fee = require('../models/Fee');
const Complaint = require('../models/Complaint');
const Leave = require('../models/Leave');
const Notice = require('../models/Notice');

const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).populate('roomId');
    
    let roomDetails = null;
    if (student.roomId) {
      roomDetails = await Room.findById(student.roomId._id).populate('occupants', 'name email phone');
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = months[currentMonth];

    const currentMonthFee = await Fee.findOne({
      studentId,
      month: currentMonthName,
      year: currentYear
    });

    const pendingFeesCount = await Fee.countDocuments({
      studentId,
      status: 'pending'
    });

    const pendingComplaintsCount = await Complaint.countDocuments({
      studentId,
      status: { $in: ['pending', 'in-progress'] }
    });

    const recentNotices = await Notice.find({
      isActive: true,
      $or: [
        { validUntil: null },
        { validUntil: { $gte: new Date() } }
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' }
      ]
    })
    .populate('createdBy', 'name')
    .sort({ priority: -1, createdAt: -1 })
    .limit(5);

    const recentComplaints = await Complaint.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(3);

    const recentLeaves = await Leave.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(3);

    const pendingLeavesCount = await Leave.countDocuments({
      studentId,
      status: 'pending'
    });

    res.json({
      student,
      roomDetails,
      currentMonthFee,
      pendingFeesCount,
      pendingComplaintsCount,
      pendingLeavesCount,
      recentNotices,
      recentComplaints,
      recentLeaves
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .populate('roomId')
      .select('-password');

    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, parentDetails } = req.body;
    
    const student = await User.findById(req.user.id);
    
    student.name = name || student.name;
    student.phone = phone || student.phone;
    student.parentDetails = parentDetails || student.parentDetails;

    await student.save();

    res.json({
      message: 'Profile updated successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: student.role,
        roomId: student.roomId,
        parentDetails: student.parentDetails
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRoomDetails = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('roomId');
    
    if (!student.roomId) {
      return res.status(404).json({ message: 'No room assigned' });
    }

    const roomDetails = await Room.findById(student.roomId._id)
      .populate('occupants', 'name email phone parentDetails');

    res.json(roomDetails);
  } catch (error) {
    console.error('Get room details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFees = async (req, res) => {
  try {
    const { year } = req.query;
    const query = { studentId: req.user.id };

    if (year) query.year = parseInt(year);

    const fees = await Fee.find(query)
      .sort({ year: -1, month: -1 });

    res.json(fees);
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const complaint = new Complaint({
      studentId: req.user.id,
      title,
      description,
      category,
      priority: priority || 'medium'
    });

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email phone');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: populatedComplaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { studentId: req.user.id };

    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason, destination, contactDuringLeave } = req.body;

    const leave = new Leave({
      studentId: req.user.id,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      destination,
      contactDuringLeave
    });

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('studentId', 'name email phone');

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave: populatedLeave
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { studentId: req.user.id };

    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getNotices = async (req, res) => {
  try {
    const { category, priority } = req.query;
    const query = {
      isActive: true,
      $or: [
        { validUntil: null },
        { validUntil: { $gte: new Date() } }
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' }
      ]
    };

    if (category) query.category = category;
    if (priority) query.priority = priority;

    const notices = await Notice.find(query)
      .populate('createdBy', 'name')
      .sort({ priority: -1, createdAt: -1 });

    res.json(notices);
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getRoomDetails,
  getFees,
  createComplaint,
  getComplaints,
  createLeave,
  getLeaves,
  getNotices
};
