const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getLeaves,
  updateLeaveStatus,
  getLeaveStats
} = require('../controllers/leaveController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getLeaves);
router.put('/:id', [
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status')
], updateLeaveStatus);
router.get('/stats', getLeaveStats);

module.exports = router;
