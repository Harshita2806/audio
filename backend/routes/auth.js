const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyEmail,
    getMe,
    updateProfile
} = require('../controllers/authController'); 
const { protect } = require('../middleware/auth');



router.post('/register', register); // Used by AuthPage.jsx for signup
router.post('/login', login);       // Used by AuthPage.jsx for login
router.get('/verify-email/:token', verifyEmail);
router.get('/me', protect, getMe);   // Verifies the user is still logged in
router.put('/profile', protect, updateProfile);

module.exports = router;