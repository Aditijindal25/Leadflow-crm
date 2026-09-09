import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || (error.request ? 'API unavailable. Start the backend and configure MONGODB_URI in server/.env.' : 'Request failed.');
    return Promise.reject(new Error(message));
  },
);
