const express = require('express');
const router = express.Router();
const { getStudentAnalytics, getMaterialAnalytics, getOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { requireTeacher } = require('../middleware/roles');

router.get('/overview', protect, getOverview);
router.get('/students', protect, requireTeacher, getStudentAnalytics);
router.get('/materials/:id', protect, requireTeacher, getMaterialAnalytics);

module.exports = router;
