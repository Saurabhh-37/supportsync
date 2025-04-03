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
  InputLabel,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
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
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
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
      
      console.log('Fetched tickets:', response); // Debug log
      // Add detailed logging for each ticket
      response.forEach(ticket => {
        console.log(`\nTicket ${ticket.id}:`);
        console.log('  Title:', ticket.title);
        console.log('  User:', ticket.user);
        console.log('  User ID:', ticket.user_id);
        console.log('  Assigned User:', ticket.assigned_user);
        console.log('  Assigned To ID:', ticket.assigned_to);
      });
      
      setTickets(response);
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async (ticketId) => {
    try {
      await ticketService.updateTicket(ticketId, {
        assigned_to: selectedAgent
      });
      
      // Refresh tickets after assignment
      fetchTickets();
      setSelectedTicket(null);
      setSelectedAgent('');
    } catch (err) {
      // Extract error message from the error object
      const errorMessage = err.detail || err.message || 'Failed to assign agent';
      setError(errorMessage);
      console.error('Error assigning agent:', err);
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
                {isAdmin && <TableCell>Created By</TableCell>}
                {isAdmin && <TableCell>Assigned To</TableCell>}
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
                  {isAdmin && (
                    <TableCell>
                      {console.log('Ticket user data:', ticket.user)} {/* Debug log */}
                      {ticket.user?.username || 'Unknown'}
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell>
                      {selectedTicket === ticket.id ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Select Agent</InputLabel>
                            <Select
                              value={selectedAgent}
                              onChange={(e) => setSelectedAgent(e.target.value)}
                              label="Select Agent"
                            >
                              <MenuItem value="">None</MenuItem>
                              {/* Add actual agents list here when available */}
                            </Select>
                          </FormControl>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAssignAgent(ticket.id)}
                          >
                            Assign
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedTicket(null);
                              setSelectedAgent('');
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>
                            {ticket.assigned_user?.username || 'Unassigned'}
                          </Typography>
                          <Tooltip title="Assign Agent">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedTicket(ticket.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  )}
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