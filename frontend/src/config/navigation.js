import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  Lightbulb as FeatureRequestIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

export const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tickets', icon: <TicketIcon />, path: '/tickets' },
  { text: 'Feature Requests', icon: <FeatureRequestIcon />, path: '/feature-requests' },
  { text: 'Users', icon: <UsersIcon />, path: '/users', adminOnly: true },
  { text: 'Admin', icon: <AdminIcon />, path: '/admin', adminOnly: true },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export const DRAWER_WIDTH = 240;
export const COLLAPSED_DRAWER_WIDTH = 65; 