import React from 'react';
import { Chip } from '@mui/material';

const getStatusColor = (status) => {
  const statusColors = {
    // Ticket statuses
    'new': 'info',
    'in_progress': 'warning',
    'resolved': 'success',
    'closed': 'default',
    
    // Feature request statuses
    'Proposed': 'info',
    'Under Review': 'warning',
    'Approved': 'success',
    'Rejected': 'error',
  };
  
  return statusColors[status] || 'default';
};

const formatStatus = (status) => {
  if (!status) return '';
  
  // Handle ticket statuses (snake_case)
  if (status.includes('_')) {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  // Handle feature request statuses (already formatted)
  return status;
};

const StatusBadge = ({ status }) => {
  return (
    <Chip
      label={formatStatus(status)}
      color={getStatusColor(status)}
      size="small"
      sx={{ 
        fontWeight: 'medium',
        textTransform: 'capitalize',
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
};

export default StatusBadge; 