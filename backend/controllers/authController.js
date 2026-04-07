const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// 🔹 Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// 🔹 LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Clean email only (IMPORTANT)
    const cleanEmail = email.trim().toLowerCase();

    console.log("LOGIN EMAIL:", cleanEmail);
    console.log("LOGIN PASSWORD:", password);

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("DB PASSWORD:", user.password);

    // ✅ Compare password correctly
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("MATCH RESULT:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        phone: user.phone,
        roomId: user.roomId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, parentDetails } = req.body;

    // ✅ Clean email
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Hash password ONCE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("REGISTER PASSWORD:", password);
    console.log("HASHED PASSWORD:", hashedPassword);

    const user = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'student',
      phone,
      parentDetails
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        phone: user.phone,
        roomId: user.roomId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('roomId');

    res.json(user);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  register,
  getProfile
};