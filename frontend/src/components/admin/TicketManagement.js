import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  MenuItem,
  Select,
  FormControl,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectCurrentUser } from '../../redux/userSlice';
import ticketService from '../../services/ticketService';

const TicketManagement = () => {
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const currentUser = useSelector(selectCurrentUser);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tickets based on user role
      let response;
      if (isAdmin) {
        // Admin can see all tickets
        response = await ticketService.getTickets();
      } else {
        // Regular users can only see their own tickets
        response = await ticketService.getUserTickets(currentUser.id);
      }
      
      console.log('Raw response from backend:', JSON.stringify(response, null, 2));
      
      // Process the response to ensure user data is properly structured
      const processedTickets = response.map(ticket => {
        console.log('Processing ticket:', {
          id: ticket.id,
          user: ticket.user,
          user_id: ticket.user_id,
          assigned_user: ticket.assigned_user,
          assigned_to: ticket.assigned_to,
          rawTicket: JSON.stringify(ticket, null, 2)
        });
        
        // Ensure user data is properly structured
        const processedTicket = {
          ...ticket,
          user: ticket.user || { username: 'Unknown', id: ticket.user_id },
          assigned_user: ticket.assigned_user || { username: 'Unassigned', id: ticket.assigned_to }
        };
        
        console.log('Processed ticket:', {
          id: processedTicket.id,
          user: processedTicket.user,
          assigned_user: processedTicket.assigned_user
        });
        
        return processedTicket;
      });
      
      setTickets(processedTickets);
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      // Ensure the status is not null or undefined
      const status = newStatus || 'open';
      
      await ticketService.updateTicket(ticketId, {
        status: status
      });
      
      // Refresh tickets after status change
      fetchTickets();
    } catch (err) {
      // Handle different types of error responses
      let errorMessage = 'Failed to update ticket status';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      console.error('Error updating ticket status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Typography color="error">
        Access denied. Admin privileges required.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {isAdmin ? 'Ticket Management' : 'My Tickets'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
          <Button
            variant="contained"
            onClick={fetchTickets}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={ticket.status || 'open'}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        size="small"
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          },
                        }}
                      >
                        <MenuItem value="open">
                          <Chip 
                            label="OPEN" 
                            color="error"
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </MenuItem>
                        <MenuItem value="in_progress">
                          <Chip 
                            label="IN PROGRESS" 
                            color="warning"
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </MenuItem>
                        <MenuItem value="resolved">
                          <Chip 
                            label="RESOLVED" 
                            color="success"
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ticket.priority.toUpperCase()} 
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TicketManagement; 