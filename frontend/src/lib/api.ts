import axios from 'axios';

let rawUrl = (process.env.NEXT_PUBLIC_API_URL || '/api').trim();
if (rawUrl.includes('your-backend-api') || rawUrl.includes('example.com')) {
  rawUrl = '/api';
}
rawUrl = rawUrl.replace(/\/+$/, '');
if (rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const API_BASE_URL = rawUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor for 401 Unauthorized redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
