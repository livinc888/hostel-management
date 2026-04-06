const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getRooms,
  createRoom,
  updateRoom,
  assignRoom,
  removeStudentFromRoom
} = require('../controllers/roomController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getRooms);
router.post('/', [
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('type').isIn(['single', 'double', 'triple', 'four']).withMessage('Invalid room type'),
  body('capacity').isInt({ min: 1, max: 4 }).withMessage('Capacity must be between 1 and 4'),
  body('floor').isInt({ min: 1 }).withMessage('Floor must be at least 1'),
  body('block').notEmpty().withMessage('Block is required')
], createRoom);
router.put('/:id', updateRoom);
router.post('/assign', [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('roomId').notEmpty().withMessage('Room ID is required')
], assignRoom);
router.post('/remove-student', [
  body('studentId').notEmpty().withMessage('Student ID is required')
], removeStudentFromRoom);

module.exports = router;
