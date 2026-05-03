const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    position: { type: Number, required: true }, // seconds in audio
    label: { type: String, default: 'Bookmark' },
    createdAt: { type: Date, default: Date.now },
});

const progressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true,
    },
    // Playback position (in seconds)
    lastPosition: {
        type: Number,
        default: 0,
    },
    // Total time listened (seconds)
    totalListened: {
        type: Number,
        default: 0,
    },
    // Percentage complete (0-100)
    percentComplete: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    bookmarks: [bookmarkSchema],
    // Last time this was accessed
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Compound unique index: one progress record per student-material pair
progressSchema.index({ student: 1, material: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
