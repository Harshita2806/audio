const User = require('../models/User');
const Material = require('../models/Material');
const Progress = require('../models/Progress');
const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

// ─── GET /api/analytics/students ─────────────────────────────────────────────
// Teacher gets stats for ALL students who have interacted with their materials
const getStudentAnalytics = async (req, res) => {
    try {
        // Get teacher's materials
        const materials = await Material.find({ teacher: req.user._id }).select('_id title subject');
        const materialIds = materials.map(m => m._id);

        // Get all progress on teacher's materials
        const progressRecords = await Progress.find({ material: { $in: materialIds } })
            .populate('student', 'name email gradeLevel')
            .populate('material', 'title subject');

        // Get all quiz attempts for teacher's quizzes
        const quizzes = await Quiz.find({ teacher: req.user._id }).select('_id title');
        const quizIds = quizzes.map(q => q._id);
        const attemptRecords = await Attempt.find({ quiz: { $in: quizIds } })
            .populate('student', 'name email')
            .populate('quiz', 'title');

        // Aggregate by student
        const studentMap = {};
        progressRecords.forEach(p => {
            if (!p.student) return;
            const sid = p.student._id.toString();
            if (!studentMap[sid]) {
                studentMap[sid] = {
                    _id: sid,
                    name: p.student.name,
                    email: p.student.email,
                    gradeLevel: p.student.gradeLevel,
                    materialsAccessed: 0,
                    totalListenedMinutes: 0,
                    avgCompletion: 0,
                    completedCount: 0,
                    quizAttempts: 0,
                    avgQuizScore: 0,
                    completionsList: [],
                    lastActive: p.updatedAt || p.createdAt,
                };
            }
            studentMap[sid].materialsAccessed += 1;
            studentMap[sid].totalListenedMinutes += Math.round((p.totalListened || 0) / 60);
            studentMap[sid].completionsList.push(p.percentComplete || 0);
            if (p.isCompleted) studentMap[sid].completedCount += 1;
            // Track most recent activity
            const recAt = p.updatedAt || p.createdAt;
            if (recAt && recAt > studentMap[sid].lastActive) {
                studentMap[sid].lastActive = recAt;
            }
        });

        attemptRecords.forEach(a => {
            if (!a.student) return;
            const sid = a.student._id.toString();
            if (!studentMap[sid]) {
                studentMap[sid] = {
                    _id: sid, name: a.student.name, email: a.student.email,
                    materialsAccessed: 0, totalListenedMinutes: 0, avgCompletion: 0,
                    completedCount: 0, quizAttempts: 0, avgQuizScore: 0,
                    completionsList: [], lastActive: a.createdAt,
                };
            }
            studentMap[sid].quizAttempts += 1;
            studentMap[sid].avgQuizScore =
                ((studentMap[sid].avgQuizScore * (studentMap[sid].quizAttempts - 1)) + (a.percentageScore || 0))
                / studentMap[sid].quizAttempts;
        });

        const students = Object.values(studentMap).map(s => ({
            ...s,
            avgCompletion: s.completionsList.length > 0
                ? Math.round(s.completionsList.reduce((a, b) => a + b, 0) / s.completionsList.length)
                : 0,
            avgQuizScore: Math.round(s.avgQuizScore),
            completionsList: undefined,
        }));

        // Sort by most recently active
        students.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));

        // Aggregate total listened hours
        const totalListenedMinutes = students.reduce((acc, s) => acc + s.totalListenedMinutes, 0);
        const avgQuizScoreAll = students.length > 0
            ? Math.round(students.reduce((acc, s) => acc + s.avgQuizScore, 0) / students.length)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                totalStudents: students.length,
                totalMaterials: materials.length,
                totalListenedMinutes,
                avgQuizScoreAll,
                students,
                materials: materials.map(m => ({ _id: m._id, title: m.title, subject: m.subject })),
            },
        });
    } catch (err) {
        console.error('getStudentAnalytics error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ─── GET /api/analytics/materials/:id ─────────────────────────────────────────
const getMaterialAnalytics = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
        if (material.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const progressRecords = await Progress.find({ material: req.params.id })
            .populate('student', 'name email');

        const totalStudents = progressRecords.length;
        const completedCount = progressRecords.filter(p => p.isCompleted).length;
        const avgCompletion = totalStudents > 0
            ? Math.round(progressRecords.reduce((s, p) => s + (p.percentComplete || 0), 0) / totalStudents)
            : 0;
        const totalListenedMinutes = Math.round(
            progressRecords.reduce((s, p) => s + (p.totalListened || 0), 0) / 60
        );

        res.status(200).json({
            success: true,
            data: {
                material: { _id: material._id, title: material.title, subject: material.subject },
                totalStudents,
                completedCount,
                completionRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
                avgCompletion,
                totalListenedMinutes,
                totalViews: material.totalViews || 0,
                totalListens: material.totalListens || 0,
                studentDetails: progressRecords,
            },
        });
    } catch (err) {
        console.error('getMaterialAnalytics error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
const getOverview = async (req, res) => {
    try {
        const [totalStudents, totalTeachers, totalMaterials] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'teacher' }),
            Material.countDocuments({ status: 'published' }),
        ]);

        const totalListened = await Progress.aggregate([
            { $group: { _id: null, total: { $sum: '$totalListened' } } },
        ]);

        const totalListensAgg = await Material.aggregate([
            { $group: { _id: null, total: { $sum: '$totalListens' } } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalTeachers,
                totalMaterials,
                totalListens: totalListensAgg[0]?.total || 0,
                totalListenedHours: Math.round((totalListened[0]?.total || 0) / 3600),
                completionRate: 0, // placeholder, compute if needed
            },
        });
    } catch (err) {
        console.error('getOverview error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

module.exports = { getStudentAnalytics, getMaterialAnalytics, getOverview };
