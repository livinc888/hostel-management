const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getComplaints,
  updateComplaint,
  getComplaintStats,
  deleteComplaint
} = require('../controllers/complaintController');

const router = express.Router();

// middleware
router.use(authMiddleware);
router.use(adminMiddleware);

// ✅ FIX: put specific routes BEFORE dynamic routes
router.get('/stats', getComplaintStats);

router.get('/', getComplaints);

router.put('/:id', [
  body('status')
    .isIn(['pending', 'in-progress', 'resolved', 'rejected'])
    .withMessage('Invalid status')
], updateComplaint);

router.delete('/:id', deleteComplaint);

module.exports = router;