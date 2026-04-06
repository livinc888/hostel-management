const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const {
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
} = require('../controllers/studentController');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty')
], updateProfile);
router.get('/room', getRoomDetails);
router.get('/fees', getFees);
router.post('/complaints', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['maintenance', 'electricity', 'water', 'furniture', 'cleaning', 'other'])
                   .withMessage('Invalid category')
], createComplaint);
router.get('/complaints', getComplaints);
router.post('/leave', [
  body('fromDate').isISO8601().withMessage('Valid from date is required'),
  body('toDate').isISO8601().withMessage('Valid to date is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('contactDuringLeave').notEmpty().withMessage('Contact during leave is required')
], createLeave);
router.get('/leave', getLeaves);
router.get('/notices', getNotices);

module.exports = router;
