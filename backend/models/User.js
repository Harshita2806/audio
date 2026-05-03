// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Please add a name'],
//         trim: true,
//         maxlength: [100, 'Name cannot exceed 100 characters'],
//     },
//     email: {
//         type: String,
//         required: [true, 'Please add an email'],
//         unique: true,
//         lowercase: true,
//         match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
//     },
//     password: {
//         type: String,
//         required: [true, 'Please add a password'],
//         minlength: 6,
//         select: false,
//     },
//     role: {
//         type: String,
//         enum: ['student', 'teacher', 'admin'],
//         default: 'student',
//     },
//     // Add these fields to your existing userSchema
//     isVerified: {
//         type: Boolean,
//         default: false,
//     },
//     verificationToken: String,
//     verificationTokenExpires: Date,
//     avatar: { type: String, default: '' },
//     gradeLevel: { type: String, default: '' },
//     preferredSpeed: { type: Number, default: 1.0, min: 0.5, max: 3.0 },
//     subject: { type: String, default: '' },
//     isActive: { type: Boolean, default: true },
//     lastLogin: { type: Date },
// }, { timestamps: true });

// // Hash password before save
// userSchema.pre('save', async function () {
//     if (!this.isModified('password')) return;
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
// });

// // Compare password method
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };
// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date, // FIXED usage
    avatar: { type: String, default: '' },
    gradeLevel: { type: String, default: '' },
    preferredSpeed: { type: Number, default: 1.0, min: 0.5, max: 3.0 },
    subject: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);