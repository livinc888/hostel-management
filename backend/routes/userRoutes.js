const express = require('express');
const router = express.Router();

const { getStudents } = require('../controllers/userController');

// ✅ FIX: normal import (no destructuring)
const authMiddleware = require('../middleware/auth');

router.get('/students', authMiddleware, getStudents);

module.exports = router;