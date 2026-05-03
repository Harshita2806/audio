const express = require('express');
const router = express.Router();
const {
    getMaterials, getMaterial, createMaterial, updateMaterial,
    deleteMaterial, publishMaterial, generateAudio, uploadAudioFile, streamAudio,
    streamChapterAudio, generateQuizFromMaterial,
} = require('../controllers/materialController');
const { protect } = require('../middleware/auth');
const { requireTeacher } = require('../middleware/roles');
const { uploadPDF, uploadAudio } = require('../config/cloudinary');

// Public/student routes
router.get('/', protect, getMaterials);
router.get('/:id', protect, getMaterial);
router.get('/:id/stream', streamAudio);
router.get('/:id/chapters/:index/stream', streamChapterAudio);

// Teacher only routes
router.post('/', protect, requireTeacher, uploadPDF.single('pdf'), createMaterial);
router.put('/:id', protect, requireTeacher, updateMaterial);
router.delete('/:id', protect, requireTeacher, deleteMaterial);
router.post('/:id/publish', protect, requireTeacher, publishMaterial);
router.post('/:id/generate-audio', protect, requireTeacher, generateAudio);
router.post('/:id/generate-quiz', protect, requireTeacher, generateQuizFromMaterial);
router.post('/:id/upload-audio', protect, requireTeacher, uploadAudio.single('audio'), uploadAudioFile);

module.exports = router;
