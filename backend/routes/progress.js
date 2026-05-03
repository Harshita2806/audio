const express = require('express');
const router = express.Router();
const {
    getProgress, getProgressForMaterial, updateProgress,
    addBookmark, deleteBookmark, getProgressSummary
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roles');

router.get('/summary', protect, requireStudent, getProgressSummary);
router.get('/', protect, requireStudent, getProgress);
router.get('/:materialId', protect, requireStudent, getProgressForMaterial);
router.post('/', protect, requireStudent, updateProgress);
router.post('/:materialId/bookmark', protect, requireStudent, addBookmark);
router.delete('/:materialId/bookmark/:bookmarkId', protect, requireStudent, deleteBookmark);

module.exports = router;
