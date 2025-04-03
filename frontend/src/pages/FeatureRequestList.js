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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import {
  setFeatureRequests,
  setLoading,
  setError,
  setFilters,
  setSearchQuery,
} from '../redux/featureRequestSlice';
import { selectIsAgent } from '../redux/userSlice';
import API from '../api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import SearchAndFilter from '../components/common/SearchAndFilter';

const FEATURE_REQUEST_STATUS = {
  PROPOSED: 'Proposed',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

const FEATURE_REQUEST_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

const FeatureRequestList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const featureRequests = useSelector(state => state.featureRequests.requests);
  const loading = useSelector(state => state.featureRequests.loading);
  const error = useSelector(state => state.featureRequests.error);
  const filters = useSelector(state => state.featureRequests.filters);
  const searchQuery = useSelector(state => state.featureRequests.searchQuery);
  const isAgent = useSelector(selectIsAgent);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [updating, setUpdating] = useState(false);

  const fetchFeatureRequests = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      console.log('Fetching feature requests with filters:', { filters, searchQuery });
      
      // Build query parameters
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await API.get('/api/feature-requests', { params });
      console.log('API Response:', response);
      
      dispatch(setFeatureRequests(response.data));
      dispatch(setError(null));
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      dispatch(setError(error.response?.data?.detail || 'Failed to fetch feature requests'));
      dispatch(setFeatureRequests([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, page, rowsPerPage, filters, searchQuery]);

  useEffect(() => {
    fetchFeatureRequests();
  }, [fetchFeatureRequests]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feature request?')) {
      try {
        setUpdating(true);
        await API.delete(`/api/feature-requests/${id}`);
        // Refresh the list after deletion
        fetchFeatureRequests();
      } catch (error) {
        console.error('Error deleting feature request:', error);
        dispatch(setError(error.response?.data?.detail || 'Failed to delete feature request'));
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleUpvote = async (id) => {
    try {
      setUpdating(true);
      await API.post(`/api/feature-requests/${id}/upvote`);
      // Refresh the list after upvoting
      fetchFeatureRequests();
    } catch (error) {
      console.error('Error upvoting feature request:', error);
      dispatch(setError(error.response?.data?.detail || 'Failed to upvote feature request'));
    } finally {
      setUpdating(false);
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
        <Button onClick={() => navigate('/feature-requests')}>
          Back to Feature Requests
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Feature Requests</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/feature-requests/create')}
        >
          New Feature Request
        </Button>
      </Box>

      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={(value) => dispatch(setSearchQuery(value))}
        filters={filters}
        onFilterChange={(newFilters) => dispatch(setFilters(newFilters))}
        type="feature"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Requester</TableCell>
              <TableCell>Upvotes</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {featureRequests.map((request) => (
              <TableRow 
                key={request.id}
                hover
                onClick={() => navigate(`/feature-requests/${request.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{request.title}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={request.priority} />
                </TableCell>
                <TableCell>{request.requester?.username || 'Unknown'}</TableCell>
                <TableCell>{request.upvotes_count || 0}</TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpvote(request.id);
                    }}
                    disabled={updating}
                  >
                    <ThumbUpIcon />
                  </IconButton>
                  {isAgent && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(request.id);
                      }}
                      disabled={updating}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={featureRequests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default FeatureRequestList; 