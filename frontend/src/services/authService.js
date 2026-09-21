import api from './api';

// Helper to decode JWT payload without external library
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    if (data.token) {
      localStorage.setItem('bibliotech_token', data.token);

      const decoded = parseJwt(data.token);
      const user = {
        userId: data.userId || (decoded ? decoded.userId : null),
        username: data.username || (decoded ? decoded.sub : credentials.username),
        role: data.role || (decoded ? decoded.role : 'STUDENT'),
      };
      localStorage.setItem('bibliotech_user', JSON.stringify(user));
    }

    return data;
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return typeof response.data === 'string' ? response.data : 'User registered successfully';
  },

  logout: () => {
    localStorage.removeItem('bibliotech_token');
    localStorage.removeItem('bibliotech_user');
  },

  getCurrentUser: () => {
    const stored = localStorage.getItem('bibliotech_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('bibliotech_token');
  },

  parseJwt,
};
