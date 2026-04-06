const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getFees,
  createFee,
  payFee,
  getFeeHistory,
  generateMonthlyFees
} = require('../controllers/feeController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getFees);
router.post('/', [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('month').isIn(['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'])
                       .withMessage('Invalid month'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], createFee);
router.post('/pay', [
  body('feeId').notEmpty().withMessage('Fee ID is required'),
  body('paymentMethod').isIn(['cash', 'online', 'cheque']).withMessage('Invalid payment method')
], payFee);
router.get('/history/:studentId', getFeeHistory);
router.post('/generate-monthly', [
  body('month').isIn(['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'])
                       .withMessage('Invalid month'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], generateMonthlyFees);

module.exports = router;
