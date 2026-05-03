const Announcement = require('../models/Announcement');
const { getIO } = require('../socket');

const getAnnouncements = async (req, res) => {
    const filter = { isActive: true };
    if (req.user.role === 'teacher') filter.teacher = req.user._id;
    // Filter out expired announcements
    filter.$or = [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }];

    const announcements = await Announcement.find(filter)
        .populate('teacher', 'name')
        .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
};

const createAnnouncement = async (req, res) => {
    const { title, content, targetGrade, targetSubject, priority, expiresAt } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    const announcement = await Announcement.create({
        title, content,
        targetGrade: targetGrade || 'all',
        targetSubject: targetSubject || 'all',
        priority: priority || 'normal',
        expiresAt: expiresAt || null,
        teacher: req.user._id,
    });
    res.status(201).json({ success: true, data: announcement });

    const io = getIO();
    if (targetGrade === 'all' && targetSubject === 'all') {
        io.to('students').emit('new-announcement', announcement);
    } else {
        if (targetGrade !== 'all') io.to(`students-grade-${targetGrade}`).emit('new-announcement', announcement);
        if (targetSubject !== 'all') io.to(`students-subject-${targetSubject}`).emit('new-announcement', announcement);
        // Fallback to all students when there is no subject-specific room information.
        io.to('students').emit('new-announcement', announcement);
    }
    io.to('teachers').emit('new-announcement', announcement);
};

const updateAnnouncement = async (req, res) => {
    let announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });
    if (announcement.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: announcement });
};

const deleteAnnouncement = async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });
    if (announcement.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await announcement.deleteOne();
    res.status(200).json({ success: true, message: 'Announcement deleted' });
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
