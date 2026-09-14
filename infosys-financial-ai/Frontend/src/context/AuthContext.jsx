import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token === 'preview-token') { setLoading(false); return; }
      if (token) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.error("Token validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, full_name, role) => {
    const data = await authService.register(email, password, full_name, role);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  // UI-preview only: lets the redesigned screens be browsed when the FastAPI
  // backend is not running. Does not touch real auth/API logic.
  const previewLogin = () => {
    const demoUser = { id: 'preview', email: 'demo@infosys.com', full_name: 'Demo Analyst', role: 'analyst' };
    localStorage.setItem('access_token', 'preview-token');
    localStorage.setItem('user', JSON.stringify(demoUser));
    setToken('preview-token');
    setUser(demoUser);
    setLoading(false);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    previewLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
