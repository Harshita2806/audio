import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('accesslearn_token');
        const savedUser = localStorage.getItem('accesslearn_user');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('accesslearn_token');
                localStorage.removeItem('accesslearn_user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback((userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('accesslearn_token', authToken);
        localStorage.setItem('accesslearn_user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('accesslearn_token');
        localStorage.removeItem('accesslearn_user');
    }, []);

    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('accesslearn_user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
