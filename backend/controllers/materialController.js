const Material = require('../models/Material');
const Progress = require('../models/Progress');
const path = require('path');
const fs = require('fs');

// ─── GET /api/materials ───────────────────────────────────────────────────────
const getMaterials = async (req, res) => {
    const { subject, gradeLevel, status, search } = req.query;
    const filter = {};

    if (req.user.role === 'teacher') {
        filter.teacher = req.user._id;
        if (status) filter.status = status;
        else filter.status = { $in: ['draft', 'processing', 'published'] };
    } else {
        filter.status = 'published';
        filter.isPublished = true;
    }

    if (subject) filter.subject = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (search) filter.$text = { $search: search };

    const materials = await Material.find(filter)
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: materials.length, data: materials });
};

// ─── GET /api/materials/:id ───────────────────────────────────────────────────
const getMaterial = async (req, res) => {
    const material = await Material.findById(req.params.id).populate('teacher', 'name email');
    if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found' });
    }
    material.totalViews += 1;
    await material.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: material });
};

// ─── POST /api/materials ──────────────────────────────────────────────────────
const createMaterial = async (req, res) => {
    const { title, description, subject, gradeLevel, chapter, teacherNotes, tags } = req.body;

    if (!title || !subject || !gradeLevel) {
        return res.status(400).json({ success: false, message: 'Title, subject and gradeLevel are required' });
    }

    const materialData = {
        title,
        description: description || '',
        subject,
        gradeLevel,
        chapter: chapter || '',
        teacherNotes: teacherNotes || '',
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
        teacher: req.user._id,
        status: 'draft',
    };

    if (req.file) {
        // Normalize to a relative /uploads/... path regardless of OS or storage backend
        const rawPath = req.file.path || req.file.secure_url || '';
        if (rawPath.startsWith('http')) {
            // Cloudinary URL
            materialData.pdfUrl = rawPath;
        } else {
            // Local disk: req.file.path is an absolute path like D:\...\uploads\pdfs\file.pdf
            // Convert to a consistent /uploads/pdfs/filename.pdf
            materialData.pdfUrl = `/uploads/pdfs/${req.file.filename || path.basename(rawPath)}`;
        }
        materialData.pdfPublicId = req.file.filename || req.file.public_id || '';
    }

    const material = await Material.create(materialData);

    // Auto-detect chapters from PDF in background (don't block response)
    if (material.pdfUrl) {
        const ttsService = require('../services/ttsService');
        ttsService.extractChaptersOnly(material).then(async (chapters) => {
            if (chapters.length > 0) {
                await Material.findByIdAndUpdate(material._id, { chapters }, { validateBeforeSave: false });
                console.log(`📚 Auto-detected ${chapters.length} chapters for material: ${material.title}`);
            }
        }).catch(err => console.warn('Auto chapter detection failed:', err.message));
    }

    res.status(201).json({ success: true, data: material });
};

// ─── PUT /api/materials/:id ───────────────────────────────────────────────────
const updateMaterial = async (req, res) => {
    let material = await Material.findById(req.params.id);
    if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found' });
    }
    if (material.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update this material' });
    }

    const updates = req.body;
    if (updates.isPublished === true || updates.isPublished === 'true') {
        updates.status = 'published';
    }

    material = await Material.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, data: material });
};

// ─── DELETE /api/materials/:id ────────────────────────────────────────────────
const deleteMaterial = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found' });
    }
    if (material.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove local files
    const cleanLocal = (url) => {
        if (url && url.startsWith('/')) {
            const localPath = path.join(__dirname, '..', url);
            if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
    };
    cleanLocal(material.pdfUrl);
    cleanLocal(material.audioUrl);
    (material.chapters || []).forEach(ch => cleanLocal(ch.audioUrl));

    await material.deleteOne();
    res.status(200).json({ success: true, message: 'Material deleted successfully' });
};

// ─── POST /api/materials/:id/publish ─────────────────────────────────────────
const publishMaterial = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found' });
    }
    if (material.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    material.status = 'published';
    material.isPublished = true;
    await material.save();
    res.status(200).json({ success: true, data: material, message: 'Material published successfully' });
};

// ─── POST /api/materials/:id/generate-audio ───────────────────────────────────
const generateAudio = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found' });
    }
    if (material.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const ttsService = require('../services/ttsService');
    material.status = 'processing';
    await material.save({ validateBeforeSave: false });

    try {
        const result = await ttsService.generateFromMaterial(material, req.user._id);

        material.audioUrl = result.audioUrl;
        material.audioDuration = result.duration || 0;
        material.transcript = result.transcript || '';
        material.status = 'published';
        material.isPublished = true;

        // Update chapters with generated audio URLs
        if (result.chapters && result.chapters.length > 0) {
            material.chapters = result.chapters.map(ch => ({
                title: ch.title,
                startPage: ch.startPage || 0,
                audioUrl: ch.audioUrl || '',
                transcript: ch.transcript || '',
            }));
        }

        // Save image descriptions
        if (result.imageDescriptions && result.imageDescriptions.length > 0) {
            material.imageDescriptions = result.imageDescriptions;
            console.log(`📸 Saved ${result.imageDescriptions.length} image descriptions`);
        }

        await material.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: `Audio generated for ${result.chapters?.length || 0} chapters${result.imageDescriptions?.length ? ` and ${result.imageDescriptions.length} images` : ''}`,
            data: material,
        });
    } catch (error) {
        material.status = 'draft';
        await material.save({ validateBeforeSave: false });
        res.status(500).json({ success: false, message: `Audio generation failed: ${error.message}` });
    }
};

// ─── POST /api/materials/:id/generate-quiz ────────────────────────────────────
const generateQuizFromMaterial = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    if (material.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const Quiz = require('../models/Quiz');
    const chapters = material.chapters || [];
    if (chapters.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No chapters found. Please generate audio first so chapters are extracted.',
        });
    }

    const questions = [];

    for (let i = 0; i < Math.min(chapters.length, 10); i++) {
        const ch = chapters[i];
        const text = ch.transcript || '';
        if (text.length < 40) continue;

        // Split into sentences, pick ones of reasonable length
        const sentences = text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.split(' ').length >= 6 && s.length < 250);

        for (let j = 0; j < Math.min(2, sentences.length); j++) {
            const sentence = sentences[j];
            const words = sentence.split(' ');
            const contentWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length > 4);
            if (contentWords.length < 3) continue;

            // Pick the answer word (roughly 60% into the sentence)
            const answerWord = contentWords[Math.floor(contentWords.length * 0.6)];
            const answer = answerWord.replace(/[^a-zA-Z0-9]/g, '');
            if (answer.length < 3) continue;

            // Distractors: other content words from same text
            const distractors = contentWords
                .filter(w => w !== answerWord)
                .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
                .filter(w => w.length >= 3)
                .slice(0, 3);

            const fillers = ['information', 'development', 'important', 'different', 'education'];
            while (distractors.length < 3) distractors.push(fillers[distractors.length]);

            const options = [...distractors.slice(0, 3)];
            const correctIdx = Math.floor(Math.random() * 4);
            options.splice(correctIdx, 0, answer);

            const blanked = words.map(w => w.replace(/[^a-zA-Z0-9]/g, '') === answer ? '______' : w).join(' ');

            questions.push({
                questionText: `From "${ch.title}": Complete — "${blanked}"`,
                options: options.slice(0, 4),
                correctAnswer: correctIdx,
                explanation: `The missing word is "${answer}".`,
                points: 1,
            });
        }
    }

    if (questions.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Could not generate questions — chapters may not have enough transcript content.',
        });
    }

    const quiz = await Quiz.create({
        title: `Quiz: ${material.title}`,
        description: `Auto-generated quiz from "${material.title}"`,
        material: material._id,
        subject: material.subject,
        gradeLevel: material.gradeLevel,
        questions,
        timeLimit: Math.min(30, questions.length * 2),
        passingScore: 60,
        teacher: req.user._id,
        isPublished: true,
    });

    res.status(201).json({
        success: true,
        message: `Generated quiz with ${questions.length} questions`,
        data: quiz,
    });
};


// ─── POST /api/materials/:id/upload-audio ─────────────────────────────────────
const uploadAudioFile = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found' });
    }
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload an audio file' });
    }

    material.audioUrl = req.file.path || req.file.secure_url;
    material.audioPublicId = req.file.filename || req.file.public_id || '';
    material.status = 'published';
    material.isPublished = true;
    await material.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, data: material });
};

// ─── GET /api/materials/:id/stream ───────────────────────────────────────────
const streamAudio = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material || !material.audioUrl) {
        return res.status(404).json({ success: false, message: 'Audio not found' });
    }

    material.totalListens += 1;
    await material.save({ validateBeforeSave: false });

    streamLocalAudio(material.audioUrl, req, res);
};

// ─── GET /api/materials/:id/chapters/:index/stream ────────────────────────────
const streamChapterAudio = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const chapterIndex = parseInt(req.params.index, 10);
    const chapter = material.chapters?.[chapterIndex];

    if (!chapter || !chapter.audioUrl) {
        return res.status(404).json({ success: false, message: 'Chapter audio not found' });
    }

    streamLocalAudio(chapter.audioUrl, req, res);
};

// ─── Helper: detect Content-Type from file extension ─────────────────────────
function getAudioContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.wav') return 'audio/wav';
    if (ext === '.ogg') return 'audio/ogg';
    if (ext === '.webm') return 'audio/webm';
    return 'audio/mpeg'; // default for .mp3 / unknown
}

// ─── Helper: stream a local or remote audio file ─────────────────────────────
function streamLocalAudio(audioUrl, req, res) {
    if (audioUrl.startsWith('http')) {
        return res.redirect(audioUrl);
    }

    const audioPath = audioUrl.startsWith('/uploads')
        ? path.join(__dirname, '..', audioUrl)
        : path.join(__dirname, '..', 'uploads', 'audio', path.basename(audioUrl));

    if (!fs.existsSync(audioPath)) {
        return res.status(404).json({ success: false, message: 'Audio file not found on disk' });
    }

    const stat = fs.statSync(audioPath);
    const contentType = getAudioContentType(audioPath);
    const range = req.headers.range;

    if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
        });
        fs.createReadStream(audioPath, { start, end }).pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': stat.size,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
        });
        fs.createReadStream(audioPath).pipe(res);
    }
}

module.exports = {
    getMaterials, getMaterial, createMaterial, updateMaterial,
    deleteMaterial, publishMaterial, generateAudio, uploadAudioFile,
    streamAudio, streamChapterAudio, generateQuizFromMaterial,
};

