const express = require('express');
const router = express.Router();
const { getStudents } = require('../controllers/userController');
const { protect } = require('../middleware);

// ✅ route: /api/users/students
router.get('/students', protect, getStudents);

module.exports = router;