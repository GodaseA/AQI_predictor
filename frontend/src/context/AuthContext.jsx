// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const loadingRef = useRef(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();
      
      console.log('Loading auth state...', { token: !!token, savedUser: !!savedUser });
      
      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        
        // Verify token with backend (silent, don't show errors)
        try {
          const freshUser = await authService.fetchUser();
          if (freshUser) {
            setUser(freshUser);
          }
        } catch (error) {
          console.warn('Token verification failed, using cached user data');
        }
      }
      setIsLoading(false);
      loadingRef.current = false;
    };
    
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Registration successful!');
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully');
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword({ currentPassword, newPassword });
      if (response.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
