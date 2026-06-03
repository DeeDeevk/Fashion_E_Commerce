import axios from 'axios';

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const seconds = retryAfter ? parseInt(retryAfter) : 60;
        window.dispatchEvent(
            new CustomEvent('rate-limit', { detail: { seconds } })
        );
        error.rateLimited = true;
        error.retryAfter = seconds;
      }
      return Promise.reject(error);
    },
);

export default authClient;