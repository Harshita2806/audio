const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctAnswer: {
        type: Number, // index into options array (0-based)
        required: true,
    },
    explanation: {
        type: String,
        default: '',
    },
    points: {
        type: Number,
        default: 1,
    },
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a quiz title'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        default: null,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        default: '',
    },
    gradeLevel: {
        type: String,
        default: '',
    },
    questions: [questionSchema],
    timeLimit: {
        type: Number, // minutes, 0 = no limit
        default: 0,
    },
    passingScore: {
        type: Number, // percentage
        default: 60,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    scheduledFor: {
        type: Date,
        default: null,
    },
    // Stats
    totalAttempts: {
        type: Number,
        default: 0,
    },
    averageScore: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
