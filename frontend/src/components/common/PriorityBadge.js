import React from 'react';
import { Chip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';

const getPriorityColor = (priority) => {
  const priorityColors = {
    // Handle both lowercase and capitalized formats
    'low': 'success',
    'Low': 'success',
    'medium': 'warning',
    'Medium': 'warning',
    'high': 'error',
    'High': 'error',
  };
  
  return priorityColors[priority] || 'default';
};

const formatPriority = (priority) => {
  if (!priority) return '';
  
  // Handle lowercase format (from tickets)
  if (priority === priority.toLowerCase()) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }
  
  // Handle already formatted priority (from feature requests)
  return priority;
};

const PriorityBadge = ({ priority }) => {
  return (
    <Chip
      icon={<FlagIcon />}
      label={formatPriority(priority)}
      color={getPriorityColor(priority)}
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

export default PriorityBadge; 