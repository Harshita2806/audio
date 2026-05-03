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
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const allowedRoles = ['student', 'teacher'];
        const userRole = allowedRoles.includes(role) ? role : 'student';

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            verificationToken,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24h
            isVerified: false
        });

        // Create verification URL
        const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

        const message = `<h1>Welcome to AccessLearn!</h1>
                        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                        <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background-color: #14b8a6; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
                        <p>This link will expire in 24 hours.</p>`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your AccessLearn Account',
                html: message,
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful! Please check your email to verify your account.'
            });
        } catch (mailErr) {
            console.error("DETAILED MAIL ERROR:", mailErr);
            // If email fails, delete the user so they can try again with correct config
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Check backend credentials.'
            });
        }
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
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
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });
    } catch (err) {
        console.error("VERIFY ERROR:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
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