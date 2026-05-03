const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// ─── GET /api/quizzes ─────────────────────────────────────────────────────────
const getQuizzes = async (req, res) => {
    const filter = {};
    if (req.user.role === 'teacher') {
        filter.teacher = req.user._id;
    } else {
        filter.isPublished = true;
    }
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.gradeLevel) filter.gradeLevel = req.query.gradeLevel;

    const quizzes = await Quiz.find(filter)
        .populate('teacher', 'name')
        .populate('material', 'title subject')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
};

// ─── GET /api/quizzes/:id ─────────────────────────────────────────────────────
const getQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id)
        .populate('teacher', 'name')
        .populate('material', 'title subject');

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Students don't get correct answers before attempting
    if (req.user.role === 'student') {
        const safeQuiz = quiz.toObject();
        safeQuiz.questions = safeQuiz.questions.map(q => {
            const { correctAnswer, ...rest } = q;
            return rest;
        });
        return res.status(200).json({ success: true, data: safeQuiz });
    }

    res.status(200).json({ success: true, data: quiz });
};

// ─── POST /api/quizzes ────────────────────────────────────────────────────────
const createQuiz = async (req, res) => {
    const { title, description, material, subject, gradeLevel, questions, timeLimit, passingScore, scheduledFor } = req.body;

    if (!title || !questions || questions.length === 0) {
        return res.status(400).json({ success: false, message: 'Title and at least one question are required' });
    }

    const quiz = await Quiz.create({
        title,
        description: description || '',
        material: material || null,
        subject: subject || '',
        gradeLevel: gradeLevel || '',
        questions,
        timeLimit: timeLimit || 0,
        passingScore: passingScore || 60,
        scheduledFor: scheduledFor || null,
        teacher: req.user._id,
    });

    res.status(201).json({ success: true, data: quiz });
};

// ─── PUT /api/quizzes/:id ─────────────────────────────────────────────────────
const updateQuiz = async (req, res) => {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: quiz });
};

// ─── DELETE /api/quizzes/:id ──────────────────────────────────────────────────
const deleteQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await quiz.deleteOne();
    res.status(200).json({ success: true, message: 'Quiz deleted' });
};

// ─── POST /api/quizzes/:id/attempt ───────────────────────────────────────────
const submitAttempt = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { answers, timeTaken } = req.body;
    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    let totalScore = 0;
    let maxScore = 0;

    const gradedAnswers = quiz.questions.map((q, i) => {
        const studentAnswer = answers.find(a => a.questionIndex === i);
        const points = q.points || 1;
        maxScore += points;

        if (!studentAnswer) return { questionIndex: i, selectedOption: -1, isCorrect: false, pointsEarned: 0 };

        const isCorrect = studentAnswer.selectedOption === q.correctAnswer;
        const pointsEarned = isCorrect ? points : 0;
        totalScore += pointsEarned;

        return {
            questionIndex: i,
            selectedOption: studentAnswer.selectedOption,
            isCorrect,
            pointsEarned,
        };
    });

    const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentageScore >= (quiz.passingScore || 60);

    const attempt = await Attempt.create({
        student: req.user._id,
        quiz: quiz._id,
        answers: gradedAnswers,
        totalScore,
        maxScore,
        percentageScore,
        passed,
        timeTaken: timeTaken || 0,
    });

    // Update quiz stats
    quiz.totalAttempts += 1;
    quiz.averageScore = ((quiz.averageScore * (quiz.totalAttempts - 1)) + percentageScore) / quiz.totalAttempts;
    await quiz.save({ validateBeforeSave: false });

    // Send back results with correct answers and explanations
    const detailedResults = gradedAnswers.map((a, i) => ({
        ...a,
        correctAnswer: quiz.questions[i].correctAnswer,
        explanation: quiz.questions[i].explanation || '',
        questionText: quiz.questions[i].questionText,
    }));

    res.status(201).json({
        success: true,
        data: {
            attempt,
            totalScore,
            maxScore,
            percentageScore,
            passed,
            detailedResults,
        },
    });
};

// ─── GET /api/quizzes/:id/results ─────────────────────────────────────────────
const getQuizResults = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const filter = { quiz: req.params.id };
    // Students only see their own results
    if (req.user.role === 'student') filter.student = req.user._id;

    const attempts = await Attempt.find(filter)
        .populate('student', 'name email')
        .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
};

module.exports = { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, submitAttempt, getQuizResults };
