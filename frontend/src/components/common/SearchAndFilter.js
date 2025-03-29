import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const TICKET_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

const FEATURE_REQUEST_STATUS = {
  PROPOSED: 'Proposed',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

const PRIORITY_OPTIONS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  type = 'ticket', // 'ticket' or 'feature'
}) => {
  const statusOptions = type === 'ticket' ? Object.values(TICKET_STATUS) : Object.values(FEATURE_REQUEST_STATUS);
  const priorityOptions = Object.values(PRIORITY_OPTIONS);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleClearFilters = () => {
    onFilterChange({
      status: '',
      priority: '',
      assignedUser: ''
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        placeholder={`Search ${type}s...`}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        >
          <MenuItem value="">All</MenuItem>
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status.replace('_', ' ').toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority || ''}
          label="Priority"
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
        >
          <MenuItem value="">All</MenuItem>
          {priorityOptions.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {type === 'ticket' && (
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Assigned To</InputLabel>
          <Select
            value={filters.assignedUser || ''}
            label="Assigned To"
            onChange={(e) => onFilterChange({ ...filters, assignedUser: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="me">Assigned to Me</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
          </Select>
        </FormControl>
      )}

      {(filters.status || filters.priority || filters.assignedUser) && (
        <IconButton
          size="small"
          onClick={handleClearFilters}
          sx={{ alignSelf: 'center' }}
        >
          <ClearIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default SearchAndFilter; 