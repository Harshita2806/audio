/**
 * API service – Production ready (Vercel → Render)
 */

const BASE = 'https://audio-iwm0.onrender.com/api'; // ✅ UPDATED

function getToken() {
    return localStorage.getItem('accesslearn_token');
}

async function request(method, endpoint, body = null, isFormData = false) {
    const headers = {};
    const token = getToken();

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const config = { method, headers };

    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const res = await fetch(`${BASE}${endpoint}`, config);

        if (!res.ok) {
            let errorMessage = `HTTP ${res.status}`;
            try {
                const data = await res.json();
                errorMessage = data.message || errorMessage;
            } catch {
                errorMessage = res.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await res.json();
        return data;

    } catch (err) {
        if (err instanceof SyntaxError) {
            throw new Error('Invalid server response');
        }
        if (err instanceof TypeError) {
            throw new Error('Network error: Cannot reach backend server');
        }
        throw err;
    }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (payload) => request('POST', '/auth/register', payload),
    login: (payload) => request('POST', '/auth/login', payload),

    // ⚠️ NOTE: Not needed now because backend handles redirect
    verifyEmail: (token) => request('GET', `/auth/verify-email/${token}`),

    getMe: () => request('GET', '/auth/me'),
    updateProfile: (payload) => request('PUT', '/auth/profile', payload),
};

// ─── Materials ────────────────────────────────────────────────────────────────
export const materialsAPI = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request('GET', `/materials${qs ? '?' + qs : ''}`);
    },
    getOne: (id) => request('GET', `/materials/${id}`),
    create: (formData) => request('POST', '/materials', formData, true),
    update: (id, payload) => request('PUT', `/materials/${id}`, payload),
    delete: (id) => request('DELETE', `/materials/${id}`),
    publish: (id) => request('POST', `/materials/${id}/publish`),
    generateAudio: (id) => request('POST', `/materials/${id}/generate-audio`),
    generateQuiz: (id) => request('POST', `/materials/${id}/generate-quiz`),
    uploadAudio: (id, formData) => request('POST', `/materials/${id}/upload-audio`, formData, true),

    // ✅ Updated full URL
    streamUrl: (id) => `https://audio-iwm0.onrender.com/api/materials/${id}/stream`,
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizzesAPI = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request('GET', `/quizzes${qs ? '?' + qs : ''}`);
    },
    getOne: (id) => request('GET', `/quizzes/${id}`),
    getByMaterial: (materialId) => request('GET', `/quizzes?materialId=${materialId}`),
    create: (payload) => request('POST', '/quizzes', payload),
    update: (id, payload) => request('PUT', `/quizzes/${id}`, payload),
    delete: (id) => request('DELETE', `/quizzes/${id}`),
    submitAttempt: (id, payload) => request('POST', `/quizzes/${id}/attempt`, payload),
    getResults: (id) => request('GET', `/quizzes/${id}/results`),
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressAPI = {
    getSummary: () => request('GET', '/progress/summary'),
    getAll: () => request('GET', '/progress'),
    getForMaterial: (materialId) => request('GET', `/progress/${materialId}`),
    update: (payload) => request('POST', '/progress', payload),
    addBookmark: (materialId, payload) => request('POST', `/progress/${materialId}/bookmark`, payload),
    deleteBookmark: (materialId, bookmarkId) => request('DELETE', `/progress/${materialId}/bookmark/${bookmarkId}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
    getOverview: () => request('GET', '/analytics/overview'),
    getStudents: () => request('GET', '/analytics/students'),
    getMaterial: (id) => request('GET', `/analytics/materials/${id}`),
};

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcementsAPI = {
    getAll: () => request('GET', '/announcements'),
    create: (payload) => request('POST', '/announcements', payload),
    update: (id, payload) => request('PUT', `/announcements/${id}`, payload),
    delete: (id) => request('DELETE', `/announcements/${id}`),
};