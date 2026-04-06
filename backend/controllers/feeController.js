const Fee = require('../models/Fee');
const User = require('../models/User');

const getFees = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, month, year, studentId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (studentId) query.studentId = studentId;

    const fees = await Fee.find(query)
      .populate('studentId', 'name email phone')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Fee.countDocuments(query);

    res.json({
      fees,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createFee = async (req, res) => {
  try {
    const { studentId, amount, month, year, dueDate } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existingFee = await Fee.findOne({ studentId, month, year });
    if (existingFee) {
      return res.status(400).json({ message: 'Fee for this month and year already exists' });
    }

    const fee = new Fee({
      studentId,
      amount,
      month,
      year,
      dueDate: new Date(dueDate)
    });

    await fee.save();

    const populatedFee = await Fee.findById(fee._id).populate('studentId', 'name email phone');

    res.status(201).json({
      message: 'Fee created successfully',
      fee: populatedFee
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const payFee = async (req, res) => {
  try {
    const { feeId, paymentMethod, transactionId } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({ message: 'Fee already paid' });
    }

    fee.status = 'paid';
    fee.paymentDate = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;

    await fee.save();

    const populatedFee = await Fee.findById(fee._id).populate('studentId', 'name email phone');

    res.json({
      message: 'Fee paid successfully',
      fee: populatedFee
    });
  } catch (error) {
    console.error('Pay fee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeeHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year } = req.query;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const query = { studentId };
    if (year) query.year = parseInt(year);

    const fees = await Fee.find(query)
      .sort({ year: -1, month: -1 });

    res.json(fees);
  } catch (error) {
    console.error('Get fee history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateMonthlyFees = async (req, res) => {
  try {
    const { month, year, amount, dueDate } = req.body;

    const students = await User.find({ role: 'student' });
    
    const createdFees = [];
    const errors = [];

    for (const student of students) {
      try {
        const existingFee = await Fee.findOne({ 
          studentId: student._id, 
          month, 
          year 
        });

        if (!existingFee) {
          const fee = new Fee({
            studentId: student._id,
            amount,
            month,
            year,
            dueDate: new Date(dueDate)
          });
          await fee.save();
          createdFees.push(fee);
        }
      } catch (error) {
        errors.push({
          studentId: student._id,
          error: error.message
        });
      }
    }

    res.json({
      message: `Generated ${createdFees.length} fees`,
      createdFees: createdFees.length,
      errors: errors.length,
      errors
    });
  } catch (error) {
    console.error('Generate monthly fees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFees,
  createFee,
  payFee,
  getFeeHistory,
  generateMonthlyFees
};
