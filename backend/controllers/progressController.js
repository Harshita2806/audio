const Progress = require('../models/Progress');
const { getIO } = require('../socket');

// ─── GET /api/progress ────────────────────────────────────────────────────────
const getProgress = async (req, res) => {
    const filter = { student: req.user._id };
    if (req.query.materialId) filter.material = req.query.materialId;

    const progress = await Progress.find(filter)
        .populate('material', 'title subject gradeLevel audioUrl audioDuration status')
        .sort({ lastAccessedAt: -1 });

    res.status(200).json({ success: true, count: progress.length, data: progress });
};

// ─── GET /api/progress/:materialId ────────────────────────────────────────────
const getProgressForMaterial = async (req, res) => {
    const progress = await Progress.findOne({
        student: req.user._id,
        material: req.params.materialId,
    }).populate('material', 'title subject audioUrl audioDuration');

    if (!progress) {
        return res.status(200).json({
            success: true,
            data: {
                lastPosition: 0,
                percentComplete: 0,
                bookmarks: [],
                isCompleted: false,
            },
        });
    }
    res.status(200).json({ success: true, data: progress });
};

// ─── POST /api/progress ───────────────────────────────────────────────────────
// Upserts progress (create or update) for a given material
const updateProgress = async (req, res) => {
    const { materialId, lastPosition, totalListened, percentComplete, isCompleted } = req.body;

    if (!materialId) {
        return res.status(400).json({ success: false, message: 'materialId is required' });
    }

    const update = {
        lastAccessedAt: Date.now(),
    };
    if (lastPosition !== undefined) update.lastPosition = lastPosition;
    if (totalListened !== undefined) update.totalListened = totalListened;
    if (percentComplete !== undefined) update.percentComplete = Math.min(Math.max(percentComplete, 0), 100);
    if (isCompleted !== undefined) update.isCompleted = isCompleted;
    if (percentComplete >= 100) update.isCompleted = true;

    const progress = await Progress.findOneAndUpdate(
        { student: req.user._id, material: materialId },
        update,
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('material', 'title subject teacher');

    res.status(200).json({ success: true, data: progress });

    // Emit progress update to teacher
    if (progress?.material?.teacher) {
        const io = getIO();
        io.to(`teacher-${progress.material.teacher}`).emit('progress-update', {
            studentId: req.user._id,
            progressPercentage: progress.percentComplete,
            courseInfo: {
                materialId,
                title: progress.material.title,
                subject: progress.material.subject,
            },
        });
    }
};

// ─── POST /api/progress/:materialId/bookmark ──────────────────────────────────
const addBookmark = async (req, res) => {
    const { position, label } = req.body;

    if (position === undefined) {
        return res.status(400).json({ success: false, message: 'position is required' });
    }

    const progress = await Progress.findOneAndUpdate(
        { student: req.user._id, material: req.params.materialId },
        {
            $push: { bookmarks: { position, label: label || 'Bookmark', createdAt: new Date() } },
            lastAccessedAt: Date.now(),
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: progress.bookmarks });
};

// ─── DELETE /api/progress/:materialId/bookmark/:bookmarkId ───────────────────
const deleteBookmark = async (req, res) => {
    const progress = await Progress.findOneAndUpdate(
        { student: req.user._id, material: req.params.materialId },
        { $pull: { bookmarks: { _id: req.params.bookmarkId } } },
        { new: true }
    );

    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });

    res.status(200).json({ success: true, data: progress.bookmarks });
};

// ─── GET /api/progress/summary ────────────────────────────────────────────────
const getProgressSummary = async (req, res) => {
    const allProgress = await Progress.find({ student: req.user._id })
        .populate('material', 'title subject gradeLevel audioDuration');

    const totalMaterials = allProgress.length;
    const completed = allProgress.filter(p => p.isCompleted).length;
    const totalListened = allProgress.reduce((sum, p) => sum + (p.totalListened || 0), 0);
    const avgCompletion = totalMaterials > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + p.percentComplete, 0) / totalMaterials)
        : 0;

    // Streak: count consecutive days with activity (simplified)
    const today = new Date();
    const recentDays = new Set();
    allProgress.forEach(p => {
        if (p.lastAccessedAt) {
            const d = new Date(p.lastAccessedAt);
            const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
            if (diff < 30) recentDays.add(diff);
        }
    });

    let streak = 0;
    for (let i = 0; i <= 30; i++) {
        if (recentDays.has(i)) streak++;
        else break;
    }

    res.status(200).json({
        success: true,
        data: {
            totalMaterials,
            completed,
            totalListenedSeconds: totalListened,
            totalListenedMinutes: Math.round(totalListened / 60),
            avgCompletion,
            streak,
            recentProgress: allProgress.slice(0, 5),
        },
    });
};

module.exports = { getProgress, getProgressForMaterial, updateProgress, addBookmark, deleteBookmark, getProgressSummary };
