const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const {
  getComplaints,
  getStudentComplaints, // ✅ add this in controller
  updateComplaint,
  getComplaintStats,
  deleteComplaint
} = require('../controllers/complaintController');

const router = express.Router();

// ✅ All routes require login
router.use(authMiddleware);

// =========================
// ✅ ADMIN ROUTES
// =========================
router.get('/stats', adminMiddleware, getComplaintStats);

router.get('/', adminMiddleware, getComplaints);

router.put('/:id', adminMiddleware, [
  body('status')
    .isIn(['pending', 'in-progress', 'resolved', 'rejected'])
    .withMessage('Invalid status')
], updateComplaint);

router.delete('/:id', adminMiddleware, deleteComplaint);

// =========================
// ✅ STUDENT ROUTE
// =========================
router.get('/my', getStudentComplaints); // 👈 IMPORTANT

module.exports = router;