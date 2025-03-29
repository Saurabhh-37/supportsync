// src/pages/TicketsPage.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  List,
  ListItem,
  Button,
  Box,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import TicketDetailDialog from '../components/TicketDetailDialog';
import API from '../api';

const TicketsPage = ({ isSidebarOpen }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [openTicketDetailDialog, setOpenTicketDetailDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get user details from Redux store
  const userDetails = useSelector((state) => state.user);
  console.log('User details from Redux store:', userDetails);

  // Update useEffect to use Redux user data
  useEffect(() => {
    if (userDetails) {
      console.log('Using user details from Redux:', userDetails);
      setCurrentUser(userDetails);
      fetchTickets(userDetails.employeeId);
    }
  }, [userDetails]);

  const fetchTickets = async (employeeId) => {
    setLoading(true);
    try {
      console.log('Fetching tickets for current user');
      const response = await API.get('/api/tickets/me');
      console.log('Raw API Response:', response);
      
      // Get tickets directly from response.data and ensure it's an array
      const ticketsData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched tickets:', ticketsData);
      
      // Log tickets by status
      const openTickets = ticketsData.filter(ticket => ticket.status === 'open');
      const inProgressTickets = ticketsData.filter(ticket => ticket.status === 'in_progress');
      const resolvedTickets = ticketsData.filter(ticket => ticket.status === 'resolved');
      
      console.log('Tickets by Status:', {
        total: ticketsData.length,
        open: openTickets.length,
        in_progress: inProgressTickets.length,
        resolved: resolvedTickets.length
      });
      
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      setTickets([]); // Set to empty array on error
      const errorMessage = error.response?.data?.detail || 'Failed to fetch tickets';
      console.log('Snackbar Error:', errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    navigate('/tickets/create');
  };

  const handleTicketDetailDialogOpen = (ticket) => {
    setSelectedTicket(ticket);
    setOpenTicketDetailDialog(true);
  };

  const handleTicketDetailDialogClose = () => setOpenTicketDetailDialog(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    console.log('Closing snackbar');
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter tickets based on the search term
  const filteredTickets = tickets.filter(ticket =>
    ticket.problemDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug log to check actual status values
  console.log('All ticket statuses:', tickets.map(t => t.status));

  // Group tickets by status (case-insensitive comparison)
  const ticketsByStatus = {
    open: filteredTickets.filter(ticket => 
      ticket.status?.toLowerCase() === 'open'),
    in_progress: filteredTickets.filter(ticket => 
      ticket.status?.toLowerCase() === 'in_progress'),
    resolved: filteredTickets.filter(ticket => 
      ticket.status?.toLowerCase() === 'resolved')
  };

  // Debug log grouped tickets
  console.log('Grouped tickets:', ticketsByStatus);

  const renderTicketCard = (ticket) => (
    <ListItem key={ticket._id} style={{ marginBottom: '16px', padding: '0' }}>
      <Card
        style={{
          width: '100%',
          borderRadius: '12px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <CardContent>
          <Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
            {ticket.name || 'No Name'}
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
            ID: {ticket.employeeId || 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
            {ticket.problemDescription ? 
              `${ticket.problemDescription.substring(0, 100)}${ticket.problemDescription.length > 100 ? '...' : ''}` 
              : 'No description available'}
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '12px' }}>
            Raised on: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown date'}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              style={{
                borderRadius: '30px',
                padding: '6px 16px',
                textTransform: 'none',
              }}
              onClick={() => handleTicketDetailDialogOpen(ticket)}
            >
              View Details
            </Button>
            <Typography 
              variant="caption" 
              style={{ 
                padding: '4px 12px',
                borderRadius: '15px',
                backgroundColor: ticket.status?.toLowerCase() === 'open' ? '#ffebee' :
                               ticket.status?.toLowerCase() === 'in_progress' ? '#e3f2fd' : '#e8f5e9',
                color: ticket.status?.toLowerCase() === 'open' ? '#c62828' :
                       ticket.status?.toLowerCase() === 'in_progress' ? '#1565c0' : '#2e7d32'
              }}
            >
              {ticket.status?.toLowerCase() === 'open' ? 'Open' :
               ticket.status?.toLowerCase() === 'in_progress' ? 'In Progress' : 'Resolved'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </ListItem>
  );

  const renderTicketColumn = (status, title) => (
    <Box flex="1" minWidth="300px" display="flex" flexDirection="column" height="100%">
      <Typography variant="h6" gutterBottom style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
        {title} ({ticketsByStatus[status].length})
      </Typography>
      <Divider style={{ marginBottom: '16px', backgroundColor: '#e0e0e0' }} />
      {loading ? (
        <Box display="flex" justifyContent="center" padding="20px">
          <CircularProgress />
        </Box>
      ) : ticketsByStatus[status].length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center" padding="20px">
          No {title.toLowerCase()} tickets
        </Typography>
      ) : (
        <List style={{ overflow: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
          {ticketsByStatus[status].map(renderTicketCard)}
        </List>
      )}
    </Box>
  );

  return (
    <div
      style={{
        marginTop: '84px',
        padding: '24px',
        height: '100vh',
        transition: 'margin-left 0.3s',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="24px"
      >
        <Box>
          <Typography variant="h4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Tickets {loading && <CircularProgress size={20} style={{ marginLeft: '10px' }} />}
          </Typography>
          {currentUser && (
            <Typography variant="subtitle1" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {currentUser.name} - {currentUser.employeeId}
            </Typography>
          )}
        </Box>
        <Box display="flex" alignItems="center">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginRight="16px"
          >
            <SearchIcon />
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleCreateTicket}
            style={{
              backgroundColor: '#40A9FF',
              color: 'white',
              borderRadius: '30px',
              padding: '10px 24px',
              boxShadow: '0 4px 10px rgba(85, 74, 255, 0.2)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Create New Ticket
          </Button>
        </Box>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap="24px"
        height="calc(100vh - 128px)"
      >
        {renderTicketColumn('open', 'Open')}
        {renderTicketColumn('in_progress', 'In Progress')}
        {renderTicketColumn('resolved', 'Resolved')}
      </Box>

      <TicketDetailDialog
        open={openTicketDetailDialog}
        onClose={handleTicketDetailDialogClose}
        ticket={selectedTicket}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TicketsPage;
