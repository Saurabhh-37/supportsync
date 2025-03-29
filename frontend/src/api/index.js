import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging and content type handling
api.interceptors.request.use(
  (config) => {
    // Set content type based on data type
    if (config.data instanceof URLSearchParams) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/profile'),
};

// Tickets API
export const tickets = {
  getAll: (filters) => api.get('/api/tickets', { params: filters }),
  getById: (id) => api.get(`/api/tickets/${id}`),
  create: (ticketData) => api.post('/api/tickets', ticketData),
  update: (id, ticketData) => api.put(`/api/tickets/${id}`, ticketData),
  delete: (id) => api.delete(`/api/tickets/${id}`),
  addComment: (ticketId, comment) => api.post(`/api/tickets/${ticketId}/comments`, comment),
  getComments: (ticketId) => api.get(`/api/tickets/${ticketId}/comments`),
};

// Feature Requests API
export const featureRequests = {
  getAll: (filters) => api.get('/api/feature-requests', { params: filters }),
  getById: (id) => api.get(`/api/feature-requests/${id}`),
  create: (requestData) => api.post('/api/feature-requests', requestData),
  update: (id, requestData) => api.put(`/api/feature-requests/${id}`, requestData),
  delete: (id) => api.delete(`/api/feature-requests/${id}`),
  upvote: (id) => api.post(`/api/feature-requests/${id}/upvote`),
  addComment: (requestId, comment) => api.post(`/api/feature-requests/${requestId}/comments`, comment),
  getComments: (requestId) => api.get(`/api/feature-requests/${requestId}/comments`),
};

// Users API
export const users = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api; 