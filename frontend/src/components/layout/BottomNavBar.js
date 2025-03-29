import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationItems } from '../../config/navigation';

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null;

  return (
    <Paper
      elevation={5}
      sx={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '600px',
        borderRadius: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        zIndex: theme.zIndex.appBar,
      }}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
        sx={{
          borderRadius: '16px',
          backgroundColor: '#fff',
          padding: '8px',
        }}
      >
        {navigationItems.map((item) => (
          <Tooltip key={item.text} title={item.text} placement="top">
            <BottomNavigationAction
              label={item.text}
              value={item.path}
              icon={item.icon}
              sx={{
                color: location.pathname === item.path ? '#40A9FF' : '#888',
                transition: 'transform 0.2s, color 0.2s',
                '&:hover': {
                  transform: 'scale(1.2)',
                  color: '#40A9FF',
                },
                '&.Mui-selected': {
                  color: '#40A9FF',
                },
              }}
            />
          </Tooltip>
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNavBar;
