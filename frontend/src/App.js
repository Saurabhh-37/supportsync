import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import store from './redux/store';
import theme from './theme';

// Auth Components
import Login from './pages/Login';
import SignupPage from './pages/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Layout Components
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import TicketCreate from './pages/TicketCreate';
import FeatureRequestList from './pages/FeatureRequestList';
import FeatureRequestDetail from './pages/FeatureRequestDetail';
import FeatureRequestCreate from './pages/FeatureRequestCreate';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Ticket Routes */}
              <Route path="tickets" element={<TicketList />} />
              <Route path="tickets/create" element={<TicketCreate />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              
              {/* Feature Request Routes */}
              <Route path="feature-requests" element={<FeatureRequestList />} />
              <Route path="feature-requests/create" element={<FeatureRequestCreate />} />
              <Route path="feature-requests/:id" element={<FeatureRequestDetail />} />
              
              {/* Settings */}
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Admin Routes */}
              <Route
                path="users"
                element={
                  <ProtectedRoute adminOnly>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
