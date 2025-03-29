import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../redux/userSlice';

const AuthHandler = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return children;
};

export default AuthHandler;
