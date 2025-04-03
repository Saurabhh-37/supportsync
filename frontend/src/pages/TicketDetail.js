import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { selectCurrentUser } from '../redux/userSlice';
import API from '../api';
import { users } from '../api';

const TICKET_STATUS = {
  NEW: 'new',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved'
};

const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  // State management
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [comments, setComments] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');

  // Fetch admin users
  const fetchAdminUsers = async () => {
    try {
      console.log('Fetching admin users...');
      const response = await users.getAll({ role: 'admin' });
      console.log('Admin users response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter the response to only include admin users
        const admins = response.data
          .filter(user => user.role === 'admin')
          .map(admin => ({
            id: admin.id,
            username: admin.username
          }));
        console.log('Processed admin users:', admins);
        setAdminUsers(admins);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.detail || 'Failed to fetch admin users');
    }
  };

  // Fetch ticket details
  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/tickets/${id}`);
      const ticketData = response.data;
      console.log('Ticket data:', ticketData); // Debug log
      setTicket(ticketData);
      setStatus(ticketData.status);
      setPriority(ticketData.priority);
      // Set the selected admin from the assigned_to field
      setSelectedAdmin(ticketData.assigned_to || '');
      setComments(ticketData.comments || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError(error.response?.data?.detail || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details and admin users on component mount
  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchTicketDetails();
    fetchAdminUsers();
  }, [id]);

  // Update ticket
  const updateTicket = async (updateData) => {
    try {
      setUpdating(true);
      const response = await API.put(`/api/tickets/${id}`, updateData);
      const updatedTicket = response.data;
      setTicket(updatedTicket);
      // Update the selected admin if we're updating the assignment
      if ('assigned_to' in updateData) {
        setSelectedAdmin(updateData.assigned_to);
      }
      setError(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError(error.response?.data?.detail || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  // Handle status update
  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus); // Optimistic update
    await updateTicket({ status: newStatus });
  };

  // Handle priority update
  const handlePriorityChange = async (event) => {
    const newPriority = event.target.value;
    setPriority(newPriority); // Optimistic update
    await updateTicket({ priority: newPriority });
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await API.post(`/api/tickets/${id}/comments`, {
        content: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
      setError(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.response?.data?.detail || 'Failed to add comment');
    }
  };

  // Handle ticket deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await API.delete(`/api/tickets/${id}`);
        navigate('/tickets');
      } catch (error) {
        console.error('Error deleting ticket:', error);
        setError(error.response?.data?.detail || 'Failed to delete ticket');
      }
    }
  };

  // Handle admin assignment
  const handleAdminChange = async (event) => {
    const newAdminId = event.target.value;
    console.log('New admin ID:', newAdminId); // Debug log
    setSelectedAdmin(newAdminId);
    try {
      await updateTicket({ assigned_to: newAdminId });
    } catch (error) {
      console.error('Error updating assigned admin:', error);
      setError(error.response?.data?.detail || 'Failed to update assigned admin');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
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

  // No ticket found
  if (!ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Ticket not found</Typography>
        <Button onClick={() => navigate('/tickets')} sx={{ mt: 2 }}>
          Back to Tickets
        </Button>
      </Box>
    );
  }

  const canEditTicket = currentUser.role === 'admin' || currentUser.role === 'agent';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Ticket Details</Typography>
        <Box>
          {canEditTicket && (
            <IconButton
              color="error"
              onClick={handleDelete}
              sx={{ mr: 2 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
          <Button variant="outlined" onClick={() => navigate('/tickets')}>
            Back to Tickets
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5">{ticket.title}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              {ticket.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!canEditTicket || updating}>
              <InputLabel>Status</InputLabel>
              <Select 
                value={status} 
                onChange={handleStatusChange} 
                label="Status"
              >
                {Object.values(TICKET_STATUS).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!canEditTicket || updating}>
              <InputLabel>Priority</InputLabel>
              <Select 
                value={priority} 
                onChange={handlePriorityChange} 
                label="Priority"
              >
                {Object.values(TICKET_PRIORITY).map((p) => (
                  <MenuItem key={p} value={p}>
                    {p.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Assigned To
            </Typography>
            {currentUser.role === 'admin' ? (
              <FormControl fullWidth disabled={!canEditTicket || updating}>
                <InputLabel>Change Assignment</InputLabel>
                <Select
                  value={selectedAdmin}
                  onChange={handleAdminChange}
                  label="Change Assignment"
                >
                  <MenuItem value="">
                    <em>Unassign</em>
                  </MenuItem>
                  {adminUsers && adminUsers.length > 0 ? (
                    adminUsers.map((admin) => (
                      <MenuItem key={admin.id} value={admin.id}>
                        {admin.username}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No admins available</MenuItem>
                  )}
                </Select>
              </FormControl>
            ) : (
              <Typography>
                {ticket.assigned_to ? adminUsers.find(admin => admin.id === ticket.assigned_to)?.username || 'Unknown' : 'Unassigned'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Created by
            </Typography>
            <Typography>{ticket.user?.username || 'Unknown'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Created at: {new Date(ticket.created_at).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(ticket.updated_at).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {comments.map((comment) => (
          <Box key={comment.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                {comment.user?.username || 'Unknown User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(comment.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body1">{comment.content}</Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}

        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={updating}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!newComment.trim() || updating}
          >
            Add Comment
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TicketDetail; 