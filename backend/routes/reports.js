const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getFeeReport,
  getOccupancyReport,
  getComplaintReport,
  getStudentReport
} = require('../controllers/reportController');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/fees', getFeeReport);
router.get('/occupancy', getOccupancyReport);
router.get('/complaints', getComplaintReport);
router.get('/students', getStudentReport);

module.exports = router;
