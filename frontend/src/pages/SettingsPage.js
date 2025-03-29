// src/pages/SettingsPage.js
import React from 'react';
import { Typography } from '@mui/material';

const SettingsPage = ({ isSidebarOpen }) => {
  return (
    <div
      style={{
        // marginLeft: isSidebarOpen ? '240px' : '64px',
        marginTop: '64px',
        padding: '24px',
        transition: 'margin-left 0.3s',
      }}
    >
      <Typography variant="h4">Settings</Typography>
      <Typography variant="body1">Configure your settings here.</Typography>
    </div>
  );
};

export default SettingsPage;
