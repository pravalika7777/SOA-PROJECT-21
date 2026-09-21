import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bibliotech_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Unable to connect to the server. Please ensure the backend gateway is running.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    let errorMessage = 'An unexpected error occurred';

    if (typeof data === 'string') {
      errorMessage = data;
    } else if (data && typeof data === 'object') {
      errorMessage = data.message || data.error || errorMessage;
    }

    if (status === 401) {
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthRoute) {
        localStorage.removeItem('bibliotech_token');
        localStorage.removeItem('bibliotech_user');
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 500) {
      toast.error('Something went wrong on the server. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
