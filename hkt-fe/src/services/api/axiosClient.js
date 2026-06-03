import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            window.dispatchEvent(new Event('logout'));
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            const seconds = retryAfter ? parseInt(retryAfter) : 60;
            // Dispatch event thay vì gọi toast trực tiếp
            window.dispatchEvent(
                new CustomEvent('rate-limit', { detail: { seconds } })
            );
            error.rateLimited = true;
            error.retryAfter = seconds;
        }

        return Promise.reject(error);
    },
);

export default axiosClient;