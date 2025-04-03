import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../../redux/userSlice';
import authService from '../../services/authService';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a token
        const token = authService.getToken();
        if (token) {
          // Set the auth header with the token
          authService.setAuthHeader(token);
          
          // Get the user profile
          const userProfile = await authService.getProfile();
          dispatch(setUser(userProfile));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Only clear auth state if it's an authentication error
        if (error.response?.status === 401) {
          authService.logout();
          dispatch(clearUser());
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider; 