const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getDashboard,
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', getDashboard);

router.get('/students', getStudents);
router.post('/students', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], createStudent);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

module.exports = router;
