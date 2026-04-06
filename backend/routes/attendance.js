const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getAttendance,
  markAttendance,
  getAttendanceReport
} = require('../controllers/attendanceController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAttendance);
router.post('/', [
  body('attendanceRecords').isArray().withMessage('Attendance records must be an array'),
  body('attendanceRecords.*.studentId').notEmpty().withMessage('Student ID is required'),
  body('attendanceRecords.*.date').isISO8601().withMessage('Valid date is required'),
  body('attendanceRecords.*.status').isIn(['present', 'absent', 'late', 'leave'])
                                      .withMessage('Invalid status')
], markAttendance);
router.get('/report', getAttendanceReport);

module.exports = router;
