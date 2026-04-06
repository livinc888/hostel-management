const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getActiveNotices
} = require('../controllers/noticeController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getNotices);
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').isIn(['general', 'maintenance', 'fees', 'events', 'emergency', 'academic'])
                   .withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high'])
                 .withMessage('Invalid priority'),
  body('targetAudience').isIn(['all', 'students', 'admins'])
                        .withMessage('Invalid target audience')
], createNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

router.get('/active', getActiveNotices);

module.exports = router;
