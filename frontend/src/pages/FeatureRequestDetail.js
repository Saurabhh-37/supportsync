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
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { mockFeatureRequests, TICKET_STATUS, TICKET_PRIORITY, FEATURE_REQUEST_STATUS } from '../data/mocks/mockData';
import { selectCurrentUser } from '../redux/userSlice';
import API from '../api';
import DeleteIcon from '@mui/icons-material/Delete';

const FeatureRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  // State management
  const [featureRequest, setFeatureRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [comments, setComments] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Fetch feature request details
  const fetchFeatureRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/feature-requests/${id}`);
      const requestData = response.data;
      setFeatureRequest(requestData);
      setStatus(requestData.status || FEATURE_REQUEST_STATUS.PROPOSED);
      setPriority(requestData.priority || TICKET_PRIORITY.MEDIUM);
      setComments(requestData.comments || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching feature request:', error);
      setError(error.response?.data?.detail || 'Failed to load feature request details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch feature request details on component mount
  useEffect(() => {
    fetchFeatureRequestDetails();
  }, [id]);

  // Update feature request
  const updateFeatureRequest = async (updateData) => {
    try {
      setUpdating(true);
      const response = await API.put(`/api/feature-requests/${id}`, updateData);
      setFeatureRequest(response.data);
      setError(null);
    } catch (error) {
      console.error('Error updating feature request:', error);
      setError(error.response?.data?.detail || 'Failed to update feature request');
    } finally {
      setUpdating(false);
    }
  };

  // Handle status update
  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus); // Optimistic update
    await updateFeatureRequest({ status: newStatus });
  };

  // Handle priority update
  const handlePriorityChange = async (event) => {
    const newPriority = event.target.value;
    setPriority(newPriority); // Optimistic update
    await updateFeatureRequest({ priority: newPriority });
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setUpdating(true);
      const response = await API.post(`/api/feature-requests/${id}/comments`, {
        content: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
      setError(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.response?.data?.detail || 'Failed to add comment');
    } finally {
      setUpdating(false);
    }
  };

  // Handle upvote
  const handleUpvote = async () => {
    try {
      setUpdating(true);
      const response = await API.post(`/api/feature-requests/${id}/upvote`);
      setFeatureRequest(prev => ({
        ...prev,
        upvotes_count: response.data.upvotes_count,
        upvoted_by: [...(prev?.upvoted_by || []), currentUser.id]
      }));
      setError(null);
    } catch (error) {
      console.error('Error upvoting feature request:', error);
      setError(error.response?.data?.detail || 'Failed to upvote feature request');
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this feature request?')) {
      try {
        setUpdating(true);
        await API.delete(`/api/feature-requests/${id}`);
        navigate('/feature-requests');
      } catch (error) {
        console.error('Error deleting feature request:', error);
        setError(error.response?.data?.detail || 'Failed to delete feature request');
      } finally {
        setUpdating(false);
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
        <Button onClick={() => navigate('/feature-requests')}>
          Back to Feature Requests
        </Button>
      </Box>
    );
  }

  // No feature request found
  if (!featureRequest) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Feature request not found</Typography>
        <Button onClick={() => navigate('/feature-requests')} sx={{ mt: 2 }}>
          Back to Feature Requests
        </Button>
      </Box>
    );
  }

  const isUpvoted = featureRequest?.upvoted_by?.includes(currentUser?.id) || false;
  const canEditFeatureRequest = currentUser?.role === 'admin' || currentUser?.role === 'agent';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Feature Request Details</Typography>
        <Box>
          {canEditFeatureRequest && (
            <IconButton
              color="error"
              onClick={handleDelete}
              sx={{ mr: 2 }}
              disabled={updating}
            >
              <DeleteIcon />
            </IconButton>
          )}
          <Button variant="outlined" onClick={() => navigate('/feature-requests')}>
            Back to Feature Requests
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">{featureRequest.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {featureRequest.upvotes_count || 0} upvotes
              </Typography>
              <IconButton
                onClick={handleUpvote}
                color={isUpvoted ? 'primary' : 'default'}
                disabled={updating || isUpvoted}
              >
                <ThumbUpIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              {featureRequest.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!canEditFeatureRequest || updating}>
              <InputLabel>Status</InputLabel>
              <Select 
                value={status} 
                onChange={handleStatusChange} 
                label="Status"
              >
                {Object.values(FEATURE_REQUEST_STATUS).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!canEditFeatureRequest || updating}>
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
              Requested by
            </Typography>
            <Typography>{featureRequest.requester?.username || 'Unknown'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Created at: {new Date(featureRequest.created_at).toLocaleString()}
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

export default FeatureRequestDetail; 