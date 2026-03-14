import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('vladi-token');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't redirect if already on auth pages
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/registro') && !path.startsWith('/checkout') && !path.startsWith('/carrito')) {
        localStorage.removeItem('vladi-token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
