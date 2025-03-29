import React, { useState, useEffect } from 'react';
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
import { Edit as EditIcon, Search as SearchIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../redux/userSlice';
import featureRequestService from '../../services/featureRequestService';

const FeatureRequestManagement = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const [featureRequests, setFeatureRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeatureRequests();
  }, []);

  const fetchFeatureRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await featureRequestService.getAll();
      setFeatureRequests(response);
    } catch (err) {
      setError(err.detail || 'Failed to fetch feature requests');
      console.error('Error fetching feature requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async (requestId) => {
    try {
      await featureRequestService.update(requestId, {
        assigned_to: selectedAgent
      });
      
      // Refresh requests after assignment
      fetchFeatureRequests();
      setSelectedRequest(null);
      setSelectedAgent('');
    } catch (err) {
      setError(err.detail || 'Failed to assign agent');
      console.error('Error assigning agent:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
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

  const filteredRequests = featureRequests.filter(request =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          Feature Request Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search feature requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
          <Button
            variant="contained"
            onClick={fetchFeatureRequests}
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
                <TableCell>Created By</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Upvotes</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status.toUpperCase()} 
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.priority.toUpperCase()} 
                      color={getPriorityColor(request.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{request.created_by}</TableCell>
                  <TableCell>
                    {selectedRequest === request.id ? (
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
                          onClick={() => handleAssignAgent(request.id)}
                        >
                          Assign
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedRequest(null);
                            setSelectedAgent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>
                          {request.assigned_to || 'Unassigned'}
                        </Typography>
                        <Tooltip title="Assign Agent">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedRequest(request.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUpIcon fontSize="small" color="primary" />
                      <Typography>{request.upvotes || 0}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {/* Handle view details */}}
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

export default FeatureRequestManagement; 