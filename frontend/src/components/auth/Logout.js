import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { clearUser } from '../../redux/userSlice';
import authService from '../../services/authService';

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the API call fails, we should still clear the local state
      dispatch(clearUser());
      navigate('/login');
    }
  };

  return (
    <Button
      color="inherit"
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
    >
      Logout
    </Button>
  );
};

export default Logout; 