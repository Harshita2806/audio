const BASE = 'https://audio-iwm0.onrender.com/api'; // MUST be this

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

    const res = await fetch(`${BASE}${endpoint}`, config);

    if (!res.ok) {
        let errorMessage = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            errorMessage = data.message || errorMessage;
        } catch { }
        throw new Error(errorMessage);
    }

    return await res.json();
}

// AUTH
export const authAPI = {
    register: (payload) => request('POST', '/auth/register', payload),
    login: (payload) => request('POST', '/auth/login', payload),
    getMe: () => request('GET', '/auth/me'),
};