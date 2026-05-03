const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ─── Generate JWT ─────────────────────────────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            name,
            email,
            password,
            role,
            verificationToken,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
            isVerified: false
        });

        // ✅ IMPORTANT CHANGE
        const verificationUrl = `https://audio-iwm0.onrender.com/api/auth/verify-email/${verificationToken}`;

        const message = `
            <h1>Verify your account</h1>
            <a href="${verificationUrl}">Click to verify</a>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Verify Email',
            html: message,
        });

        res.status(201).json({
            success: true,
            message: 'Check your email to verify account'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

// ─── GET /api/auth/verify-email/:token ────────────────────────────────────────
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect("https://audio-drab-xi.vercel.app/verify-failed");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        // ✅ REDIRECT TO FRONTEND
        return res.redirect("https://audio-drab-xi.vercel.app/login?verified=true");

    } catch (err) {
        console.error(err);
        res.redirect("https://audio-drab-xi.vercel.app/verify-failed");
    }
};
// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Your email is not verified. Please check your inbox for the verification link.'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                gradeLevel: user.gradeLevel,
                subject: user.subject,
                preferredSpeed: user.preferredSpeed,
            },
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { name, gradeLevel, subject, preferredSpeed } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (gradeLevel !== undefined) updates.gradeLevel = gradeLevel;
        if (subject !== undefined) updates.subject = subject;
        if (preferredSpeed !== undefined) updates.preferredSpeed = preferredSpeed;

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error("UPDATE PROFILE ERROR:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    register,
    verifyEmail,
    login,
    getMe,
    updateProfile
};