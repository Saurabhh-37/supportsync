import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  Lightbulb as FeatureIcon,
  Warning as HighPriorityIcon,
  CheckCircle as LowPriorityIcon,
  TrendingUp as TrendingIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import API from '../api';

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    openTickets: 0,
    highPriorityTickets: 0,
    lowPriorityTickets: 0,
    totalFeatureRequests: 0,
    pendingFeatureRequests: 0,
    topFeatureRequests: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tickets
        const ticketsResponse = await API.get('/api/tickets');
        const tickets = ticketsResponse.data;

        // Fetch feature requests
        const featureRequestsResponse = await API.get('/api/feature-requests');
        const featureRequests = featureRequestsResponse.data;

        // Calculate statistics
        const openTickets = tickets.filter(ticket => ticket.status !== 'CLOSED').length;
        const highPriorityTickets = tickets.filter(
          ticket => ticket.priority === 'HIGH' && ticket.status !== 'CLOSED'
        ).length;
        const lowPriorityTickets = tickets.filter(
          ticket => ticket.priority === 'LOW' && ticket.status !== 'CLOSED'
        ).length;

        const totalFeatureRequests = featureRequests.length;
        const pendingFeatureRequests = featureRequests.filter(
          request => request.status === 'UNDER_REVIEW'
        ).length;

        const topFeatureRequests = [...featureRequests]
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 5);

        setStats({
          openTickets,
          highPriorityTickets,
          lowPriorityTickets,
          totalFeatureRequests,
          pendingFeatureRequests,
          topFeatureRequests
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        {user && (
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserIcon color="primary" />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{user.username}</Typography>
              <Typography variant="body2" color="text.secondary">{user.role}</Typography>
            </Box>
          </Paper>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TicketIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Open Tickets
                </Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {stats.openTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HighPriorityIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  High Priority
                </Typography>
              </Box>
              <Typography variant="h3" color="error">
                {stats.highPriorityTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LowPriorityIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Low Priority
                </Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {stats.lowPriorityTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FeatureIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Feature Requests
                </Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {stats.totalFeatureRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Feature Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Top Requested Features
              </Typography>
            </Box>
            <List>
              {stats.topFeatureRequests.map((feature, index) => (
                <React.Fragment key={feature.id}>
                  <ListItem>
                    <ListItemText
                      primary={feature.title}
                      secondary={`${feature.upvotes} upvotes • ${feature.status}`}
                    />
                  </ListItem>
                  {index < stats.topFeatureRequests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pending Feature Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FeatureIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Pending Feature Requests
              </Typography>
            </Box>
            <Typography variant="h3" color="warning.main" align="center">
              {stats.pendingFeatureRequests}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Awaiting Review
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 