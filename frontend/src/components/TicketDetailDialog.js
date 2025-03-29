import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  Divider,
  TextField,
  List,
  ListItem,
  Stepper,
  Step,
  StepLabel,
  Chip,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';

// Status and Priority enums matching backend
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

const getStatusStep = (status) => {
  switch (status) {
    case TICKET_STATUS.NEW:
      return 0;
    case TICKET_STATUS.IN_PROGRESS:
      return 1;
    case TICKET_STATUS.RESOLVED:
      return 2;
    case TICKET_STATUS.CLOSED:
      return 3;
    default:
      return 0;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case TICKET_PRIORITY.HIGH:
      return 'error';
    case TICKET_PRIORITY.MEDIUM:
      return 'warning';
    case TICKET_PRIORITY.LOW:
      return 'success';
    default:
      return 'default';
  }
};

const TicketDetailDialog = ({ open, onClose, ticket, onUpdateStatus, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reference to the chat container
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [ticket?.comments]);

  if (!ticket) return null;

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onAddComment(ticket.id, newComment);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError(null);

    try {
      await onUpdateStatus(ticket.id, newStatus);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{ borderRadius: '12px' }}>
      <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#333', textAlign: 'center' }}>
        Ticket Details
      </DialogTitle>
      <DialogContent sx={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <Box marginBottom="24px">
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#333' }} gutterBottom>
            Status Tracker
          </Typography>
          <Stepper activeStep={getStatusStep(ticket.status)} alternativeLabel>
            {Object.values(TICKET_STATUS).map((status, index) => (
              <Step key={index}>
                <StepLabel 
                  sx={{ 
                    color: '#333', 
                    fontFamily: 'Poppins, sans-serif',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleStatusUpdate(status)}
                >
                  {status.replace('_', ' ')}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content Below Status Tracker */}
        <Box display="flex" flexWrap="wrap" gap="24px" flex="1">
          {/* First Column: Ticket Details */}
          <Box flex="1" minWidth="300px" sx={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)', padding: '16px' }}>
            <Box marginBottom="16px">
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                Title: {ticket.title}
              </Typography>
              <Box display="flex" gap={1} alignItems="center" marginTop={1}>
                <Chip 
                  label={ticket.priority} 
                  color={getPriorityColor(ticket.priority)}
                  size="small"
                />
                <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Created: {new Date(ticket.created_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Box marginBottom="16px">
              <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif' }}><strong>Description:</strong></Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>{ticket.description}</Typography>
            </Box>
            <Box marginBottom="16px">
              <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif' }}><strong>Assigned To:</strong></Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                {ticket.assigned_to ? `User ID: ${ticket.assigned_to}` : 'Unassigned'}
              </Typography>
            </Box>
          </Box>

          {/* Divider Between Columns */}
          <Box width="1px" bgcolor="gray.300" height="auto" />

          {/* Second Column: Chat Interface */}
          <Box flex="1" minWidth="300px" display="flex" flexDirection="column" sx={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)' }}>
            <Box marginBottom="16px">
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>Comments</Typography>
            </Box>

            {/* Comments Section */}
            <List
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                maxHeight: '200px',
                padding: '0',
                marginBottom: '16px',
              }}
              ref={chatContainerRef}
            >
              {ticket.comments?.map((comment) => (
                <ListItem key={comment.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '8px 0' }}>
                  <Box
                    sx={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#f1f1f1',
                      maxWidth: '100%',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      <strong>{comment.user.name}:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {comment.text}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>

            {/* Comment Input Section */}
            <Box display="flex" marginTop="16px" sx={{ gap: '8px' }}>
              <TextField
                fullWidth
                label="Add a Comment"
                variant="outlined"
                value={newComment}
                onChange={handleCommentChange}
                size="small"
                disabled={loading}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#f1f1f1',
                }}
              />
              <Button
                onClick={handleSendComment}
                color="primary"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#40A9FF',
                  '&:hover': {
                    backgroundColor: '#4038b6',
                  },
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Send"}
              </Button>
            </Box>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDetailDialog;
