const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getStudents
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/students', getStudents);

module.exports = router;
