/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [audioProgress, setAudioProgress] = useState(null);
    const [audioComplete, setAudioComplete] = useState(null);

    useEffect(() => {
        if (isAuthenticated && token) {
            // Connect to socket
            socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                auth: { token },
                transports: ['websocket', 'polling'],
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log('Connected to socket');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from socket');
                setIsConnected(false);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            // Listen for announcements
            socket.on('new-announcement', (announcement) => {
                setAnnouncements(prev => [announcement, ...prev]);
            });

            // Listen for progress updates
            socket.on('progress-update', (update) => {
                setProgressUpdates(prev => [update, ...prev]);
            });

            // Listen for audio progress
            socket.on('audio-progress', (progress) => {
                setAudioProgress(progress);
            });

            socket.on('audio-complete', (data) => {
                setAudioComplete(data);
                setAudioProgress(null); // Clear progress
            });

            // Cleanup on unmount or logout
            return () => {
                socket.disconnect();
                setIsConnected(false);
            };
        } else {
            // Disconnect if not authenticated
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
    }, [isAuthenticated, token]);

    const clearAnnouncements = () => setAnnouncements([]);
    const clearProgressUpdates = () => setProgressUpdates([]);
    const clearAudioProgress = () => setAudioProgress(null);
    const clearAudioComplete = () => setAudioComplete(null);

    return (
        <SocketContext.Provider value={{
            isConnected,
            announcements,
            progressUpdates,
            audioProgress,
            audioComplete,
            clearAnnouncements,
            clearProgressUpdates,
            clearAudioProgress,
            clearAudioComplete,
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};