import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired, log out
            logout();
          } else {
            // Set token in axios header
            api.defaults.headers.common['x-auth-token'] = token;
            
            // Get user data
            const res = await api.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/me`);
            setUser(res.data);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/google`;
  };

  // Handle OAuth callback
  const handleAuthCallback = async (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['x-auth-token'] = token;
    
    try {
      const res = await api.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/me`);
      setUser(res.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth callback error:', error);
      logout();
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        handleGoogleLogin,
        handleAuthCallback,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;