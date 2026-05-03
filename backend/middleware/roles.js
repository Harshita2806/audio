/**
 * Role-based access control middleware
 * Usage: router.get('/route', protect, authorize('teacher'), handler)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

const requireStudent = authorize('student', 'admin');
const requireTeacher = authorize('teacher', 'admin');
const requireAdmin = authorize('admin');

module.exports = { authorize, requireStudent, requireTeacher, requireAdmin };
