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

  // Fetch ticket details
  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/tickets/${id}`);
      const ticketData = response.data;
      setTicket(ticketData);
      setStatus(ticketData.status);
      setPriority(ticketData.priority);
      setComments(ticketData.comments || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError(error.response?.data?.detail || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details on component mount
  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  // Update ticket
  const updateTicket = async (updateData) => {
    try {
      setUpdating(true);
      const response = await API.put(`/api/tickets/${id}`, updateData);
      setTicket(response.data);
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
              Created by
            </Typography>
            <Typography>{ticket.user?.username || 'Unknown'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Assigned to
            </Typography>
            <Typography>{ticket.assigned_user?.username || 'Unassigned'}</Typography>
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