const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    startPage: Number,
    endPage: Number,
    audioUrl: String,
    transcript: String,
}, { _id: true });


const quizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [String],          // 4 MCQ options
    correctAnswer: { type: Number, default: 0 }, // index of correct option
    chapterIndex: { type: Number, default: -1 }, // -1 = general
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
}, { _id: true });

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject'],
        enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
            'Geography', 'English', 'Science', 'Social Science', 'Other'],
    },
    gradeLevel: {
        type: String,
        required: [true, 'Please add a grade/class level'],
    },
    chapter: {
        type: String,
        default: '',
    },
    // Chapters extracted from PDF
    chapters: [chapterSchema],
    // Teacher who uploaded
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // File URLs
    pdfUrl: {
        type: String,
        default: '',
    },
    pdfPublicId: {
        type: String,
        default: '',
    },
    // AI-generated image descriptions from PDF
    imageDescriptions: [{
        pageNum: Number,
        imageIndex: Number,
        description: String,
        createdAt: { type: Date, default: Date.now },
    }],
    audioUrl: {
        type: String,
        default: '',
    },
    audioPublicId: {
        type: String,
        default: '',
    },
    audioDuration: {
        type: Number, // seconds
        default: 0,
    },
    // Additional teacher narration notes
    teacherNotes: {
        type: String,
        default: '',
    },
    // AI-generated transcript of the audio
    transcript: {
        type: String,
        default: '',
    },
    // Content status
    status: {
        type: String,
        enum: ['draft', 'processing', 'published', 'archived'],
        default: 'draft',
    },
    // Accessibility tags
    tags: [String],
    // Stats
    totalViews: {
        type: Number,
        default: 0,
    },
    totalListens: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Text search index
materialSchema.index({ title: 'text', description: 'text', subject: 'text' });

module.exports = mongoose.model('Material', materialSchema);
