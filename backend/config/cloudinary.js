const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

// ─── Local storage fallback ──────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
const pdfDir = path.join(uploadsDir, 'pdfs');
const audioDir = path.join(uploadsDir, 'audio');

[uploadsDir, pdfDir, audioDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const localPdfStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pdfDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const localAudioStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, audioDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

// ─── Cloudinary storage ───────────────────────────────────────────────────────
const cloudinaryPdfStorage = useCloudinary ? new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'accesslearn/pdfs',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
    },
}) : null;

const cloudinaryAudioStorage = useCloudinary ? new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'accesslearn/audio',
        resource_type: 'video', // Cloudinary uses 'video' for audio
        allowed_formats: ['mp3', 'wav', 'ogg'],
    },
}) : null;

// ─── Multer instances ─────────────────────────────────────────────────────────
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'), false);
};

const audioFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Only audio files are allowed!'), false);
};

const uploadPDF = multer({
    storage: useCloudinary ? cloudinaryPdfStorage : localPdfStorage,
    fileFilter: pdfFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const uploadAudio = multer({
    storage: useCloudinary ? cloudinaryAudioStorage : localAudioStorage,
    fileFilter: audioFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

module.exports = { cloudinary, uploadPDF, uploadAudio, useCloudinary };
