const User = require('../models/User');
const Room = require('../models/Room');
const Fee = require('../models/Fee');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Notice = require('../models/Notice');

const getDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const availableRooms = totalRooms - occupiedRooms;
    
    const pendingFees = await Fee.countDocuments({ status: 'pending' });
    const complaintsCount = await Complaint.countDocuments({ status: 'pending' });

    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email phone createdAt');

    const recentComplaints = await Complaint.find({ status: 'pending' })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStudents,
      availableRooms,
      occupiedRooms,
      pendingFees,
      complaintsCount,
      recentStudents,
      recentComplaints
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'with-room') {
      query.roomId = { $ne: null };
    } else if (status === 'without-room') {
      query.roomId = null;
    }

    const students = await User.find(query)
      .populate('roomId', 'roomNumber type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    // Check if this is the /api/users/students endpoint (return array directly)
    if (req.originalUrl.includes('/api/users/students')) {
      return res.json(students);
    }

    // For /api/admin/students, return paginated response
    res.json({
      students,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, parentDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    const student = new User({
      name,
      email,
      password,
      role: 'student',
      phone,
      parentDetails
    });

    await student.save();

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: student.role,
        roomId: student.roomId
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate('roomId')
      .select('-password');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, parentDetails, roomId } = req.body;
    
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (email && email !== student.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    student.name = name || student.name;
    student.email = email || student.email;
    student.phone = phone || student.phone;
    student.parentDetails = parentDetails || student.parentDetails;
    student.roomId = roomId || student.roomId;

    await student.save();

    res.json({
      message: 'Student updated successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: student.role,
        roomId: student.roomId
      }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboard,
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent
};
