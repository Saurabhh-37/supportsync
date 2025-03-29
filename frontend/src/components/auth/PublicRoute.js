import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, clearUser } from '../../redux/userSlice';
import authService from '../../services/authService';

const PublicRoute = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  useEffect(() => {
    // Clear authentication state when accessing public routes
    const token = authService.getToken();
    if (token) {
      authService.logout();
      dispatch(clearUser());
    }
  }, [location.pathname, dispatch]);

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // If user is not authenticated, show the public route
  return children;
};

export default PublicRoute; 