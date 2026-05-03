const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    answers: [{
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true }, // 0-based index
        isCorrect: { type: Boolean, default: false },
        pointsEarned: { type: Number, default: 0 },
    }],
    totalScore: {
        type: Number,
        default: 0,
    },
    maxScore: {
        type: Number,
        default: 0,
    },
    percentageScore: {
        type: Number,
        default: 0,
    },
    passed: {
        type: Boolean,
        default: false,
    },
    timeTaken: {
        type: Number, // seconds
        default: 0,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
