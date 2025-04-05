import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const location = useLocation();
  const { handleAuthCallback, isAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleAuthCallback(token);
    }
  }, [location, handleAuthCallback]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
        <p className="mt-2 text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;