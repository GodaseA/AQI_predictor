// src/services/authService.js
import apiClient from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.success && response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.success && response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },
  
  // Get auth token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData);
    if (response.success && response.data) {
      const currentUser = authService.getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
    return response;
  },
  
  // Change password
  changePassword: async (passwords) => {
    return await apiClient.put('/auth/change-password', passwords);
  },
  
  // Get fresh user data from server
  fetchUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.success && response.data) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Fetch user error:', error);
      return null;
    }
  }
};

// Add token to API requests
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses - but don't auto-logout on every 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear storage if it's an auth endpoint error
      const isAuthEndpoint = error.config.url.includes('/auth/');
      if (!isAuthEndpoint) {
        console.warn('Auth error on non-auth endpoint, but keeping session');
        return Promise.reject(error);
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);
