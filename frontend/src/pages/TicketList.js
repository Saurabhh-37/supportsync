import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import {
  setTickets,
  setLoading,
  setError,
  setFilters,
  setSearchQuery,
} from '../redux/ticketSlice';
import { selectIsAgent } from '../redux/userSlice';
import API from '../api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import SearchAndFilter from '../components/common/SearchAndFilter';

const TicketList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tickets = useSelector(state => state.tickets.tickets);
  const loading = useSelector(state => state.tickets.loading);
  const error = useSelector(state => state.tickets.error);
  const filters = useSelector(state => state.tickets.filters);
  const searchQuery = useSelector(state => state.tickets.searchQuery);
  const isAgent = useSelector(selectIsAgent);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [updating, setUpdating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      console.log('Fetching tickets from API');
      
      // Build query parameters
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await API.get('/api/tickets/me', { params });
      console.log('API Response:', response);
      
      dispatch(setTickets(response.data));
      dispatch(setError(null));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to fetch tickets';
      dispatch(setError(errorMessage));
      dispatch(setTickets([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, page, rowsPerPage, filters, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        setUpdating(true);
        await API.delete(`/api/tickets/${id}`);
        // Refresh tickets after deletion
        fetchTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
        dispatch(setError('Failed to delete ticket'));
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Tickets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tickets/create')}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          New Ticket
        </Button>
      </Box>

      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={(value) => dispatch(setSearchQuery(value))}
        filters={filters}
        onFilterChange={(newFilters) => dispatch(setFilters(newFilters))}
        type="ticket"
      />

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow 
                key={ticket.id}
                hover
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{ticket.title}</TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    {ticket.assigned_user?.username || 'Unassigned'}
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(ticket.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {isAgent && (
                      <Tooltip title="Delete Ticket">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(ticket.id);
                          }}
                          disabled={updating}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'error.light',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-select': {
              borderRadius: 1,
              padding: '4px 8px',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            },
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default TicketList; 