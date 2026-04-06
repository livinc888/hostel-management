const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');
const Fee = require('./models/Fee');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Fee.deleteMany({});

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@hostel.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890',
      parentDetails: {
        fatherName: 'Admin Father',
        fatherPhone: '9876543210',
        motherName: 'Admin Mother',
        motherPhone: '9876543211',
        address: 'Admin Address'
      }
    });
    await admin.save();

    // Create student user
    const student = new User({
      name: 'John Doe',
      email: 'student@hostel.com',
      password: 'student123',
      role: 'student',
      phone: '9876543212',
      parentDetails: {
        fatherName: 'John Father',
        fatherPhone: '9876543213',
        motherName: 'John Mother',
        motherPhone: '9876543214',
        address: 'Student Address'
      }
    });
    await student.save();

    // Create rooms
    const rooms = [
      { roomNumber: 'A101', type: 'double', capacity: 2, floor: 1, block: 'A' },
      { roomNumber: 'A102', type: 'double', capacity: 2, floor: 1, block: 'A' },
      { roomNumber: 'A103', type: 'triple', capacity: 3, floor: 1, block: 'A' },
      { roomNumber: 'B101', type: 'single', capacity: 1, floor: 1, block: 'B' },
      { roomNumber: 'B102', type: 'double', capacity: 2, floor: 1, block: 'B' },
    ];

    const createdRooms = await Room.insertMany(rooms);

    // Assign student to first room
    student.roomId = createdRooms[0]._id;
    createdRooms[0].occupants.push(student._id);
    createdRooms[0].status = 'occupied';
    
    await student.save();
    await createdRooms[0].save();

    // Create fees for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = months[currentMonth];

    const fee = new Fee({
      studentId: student._id,
      amount: 5000,
      month: currentMonthName,
      year: currentYear,
      dueDate: new Date(currentYear, currentMonth + 1, 5),
      status: 'pending'
    });
    await fee.save();

    console.log('Seed data created successfully!');
    console.log('Admin login: admin@hostel.com / admin123');
    console.log('Student login: student@hostel.com / student123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

seedData();
