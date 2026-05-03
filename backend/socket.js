const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io;

const socketOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
];

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: socketOrigins,
            credentials: true,
            methods: ['GET', 'POST'],
        },
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return next(new Error('Authentication error'));
            }
            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.user._id} (${socket.user.role})`);

        socket.join('users');
        socket.join(`user-${socket.user._id}`);

        if (socket.user.role === 'student') {
            socket.join('students');
            if (socket.user.gradeLevel) socket.join(`students-grade-${socket.user.gradeLevel}`);
            if (socket.user.subject) socket.join(`students-subject-${socket.user.subject}`);
        }

        if (socket.user.role === 'teacher') {
            socket.join('teachers');
            socket.join(`teacher-${socket.user._id}`);
            if (socket.user.subject) socket.join(`teachers-subject-${socket.user.subject}`);
        }

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.user._id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO has not been initialized. Call initSocket(server) first.');
    }
    return io;
};

module.exports = { initSocket, getIO };
