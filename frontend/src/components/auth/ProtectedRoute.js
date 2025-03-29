import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsAdmin } from '../../redux/userSlice';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();
  const user = useSelector((state) => state.user.user);

  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    isAdmin,
    pathname: location.pathname,
    adminOnly,
    user,
  });

  if (!isAuthenticated) {
    console.log('Access denied: User not authenticated');
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the route requires admin access
  if (adminOnly && !isAdmin) {
    console.log('Access denied: Admin route requires admin role');
    // Redirect to dashboard if non-admin tries to access admin routes
    return <Navigate to="/dashboard" replace />;
  }

  // If roles are specified, check if user has required role
  if (adminOnly && !isAdmin) {
    console.log('Access denied: Route requires specific roles:', adminOnly);
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 