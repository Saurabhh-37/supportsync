import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import { Delete as DeleteIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { mockUsers } from '../data/mocks/mockData';
import { selectCurrentUser } from '../redux/userSlice';
import ticketService from '../services/ticketService';
import uploadService from '../services/uploadService';

// Status and Priority enums matching backend exactly
const TICKET_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const TicketCreate = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TICKET_PRIORITY.MEDIUM,
    status: TICKET_STATUS.NEW,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    console.log('Checking authentication token:', token ? 'Token exists' : 'No token found');
    if (!token) {
      console.log('No authentication token found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', { name, value });
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated form data:', updated);
      return updated;
    });
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    console.log('Validating form with data:', formData);
    const errors = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
    } else if (formData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!formData.description.trim()) {
      errors.push('Description is required');
    } else if (formData.description.length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      setError(errors.join(', '));
      return false;
    }

    console.log('Form validation passed');
    return true;
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setUploadError(null);
    const newAttachments = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        const attachment = await uploadService.uploadAttachment(file);
        newAttachments.push(attachment);
        setAttachments(newAttachments);
      } catch (err) {
        setUploadError(`Failed to upload "${file.name}": ${err.message}`);
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await uploadService.deleteAttachment(attachmentId);
      setAttachments(attachments.filter(att => att.id !== attachmentId));
    } catch (err) {
      setUploadError(`Failed to delete attachment: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed, stopping submission');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Preparing to create ticket with data:', formData);
      const token = localStorage.getItem('token');
      console.log('Current auth token:', token ? 'Token exists' : 'No token found');

      const response = await ticketService.createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        attachmentIds: attachments.map(att => att.id), // Add attachment IDs to ticket creation
      });
      
      console.log('Ticket created successfully:', response);
      navigate('/tickets');
    } catch (err) {
      console.error('Error creating ticket:', {
        error: err,
        response: err.response,
        message: err.message,
        stack: err.stack
      });
      
      if (err.detail === 'Authentication required. Please log in.') {
        console.log('Authentication error, redirecting to login');
        navigate('/login');
      } else {
        if (err.response?.data?.detail) {
          const validationErrors = err.response.data.detail;
          if (Array.isArray(validationErrors)) {
            setError(validationErrors.map(err => err.msg).join(', '));
          } else {
            setError(err.response.data.detail);
          }
        } else {
          setError(err.detail || 'Failed to create ticket. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Create New Ticket</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/tickets')}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                error={error && !formData.title.trim()}
                helperText={error && !formData.title.trim() ? 'Title is required' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                disabled={loading}
                error={error && !formData.description.trim()}
                helperText={error && !formData.description.trim() ? 'Description is required' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                  required
                  disabled={loading}
                >
                  {Object.entries(TICKET_PRIORITY).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Attachments
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  disabled={loading}
                >
                  Add Files
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </Button>
                {uploadError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {uploadError}
                  </Alert>
                )}
              </Box>

              {attachments.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 2 }}>
                  <List>
                    {attachments.map((attachment, index) => (
                      <React.Fragment key={attachment.id}>
                        <ListItem>
                          <ListItemText
                            primary={attachment.filename}
                            secondary={`${(attachment.file_size / 1024).toFixed(2)} KB`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < attachments.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {error}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tickets')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Create Ticket"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TicketCreate; 