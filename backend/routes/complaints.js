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

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getComplaints);
router.put('/:id', [
  body('status').isIn(['pending', 'in-progress', 'resolved', 'rejected'])
                .withMessage('Invalid status')
], updateComplaint);
router.get('/stats', getComplaintStats);
router.delete('/:id', deleteComplaint);

module.exports = router;
