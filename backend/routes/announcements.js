const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const { requireTeacher } = require('../middleware/roles');

router.get('/', protect, getAnnouncements);
router.post('/', protect, requireTeacher, createAnnouncement);
router.put('/:id', protect, requireTeacher, updateAnnouncement);
router.delete('/:id', protect, requireTeacher, deleteAnnouncement);

module.exports = router;
