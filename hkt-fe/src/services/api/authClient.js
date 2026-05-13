import axios from 'axios';

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default authClient;
