import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import TicketManagement from '../components/admin/TicketManagement';
import FeatureRequestManagement from '../components/admin/FeatureRequestManagement';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="admin tabs"
        >
          <Tab label="Tickets" />
          <Tab label="Feature Requests" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <TicketManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <FeatureRequestManagement />
      </TabPanel>
    </Box>
  );
};

export default AdminPage; 