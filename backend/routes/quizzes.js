const express = require('express');
const router = express.Router();
const {
    getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, submitAttempt, getQuizResults
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { requireTeacher } = require('../middleware/roles');

router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/', protect, requireTeacher, createQuiz);
router.put('/:id', protect, requireTeacher, updateQuiz);
router.delete('/:id', protect, requireTeacher, deleteQuiz);
router.post('/:id/attempt', protect, submitAttempt);
router.get('/:id/results', protect, getQuizResults);

module.exports = router;
