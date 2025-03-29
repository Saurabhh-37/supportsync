import api from '../api';

const ticketService = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    try {
      console.log('Starting ticket creation with data:', ticketData);
      
      // Verify token exists
      const token = localStorage.getItem('token');
      console.log('Auth token status:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.error('No authentication token found');
        throw { detail: 'Authentication required. Please log in.' };
      }

      // Make the API call
      console.log('Making API call to create ticket');
      console.log('Request URL:', '/api/tickets');
      console.log('Request data:', ticketData);
      
      const response = await api.post('/api/tickets', ticketData);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in createTicket:', {
        error: error,
        response: error.response,
        message: error.message,
        config: error.config,
        stack: error.stack
      });

      if (error.response?.status === 401) {
        console.log('Authentication error (401)');
        throw { detail: 'Authentication required. Please log in.' };
      }
      if (error.response?.status === 422) {
        console.log('Validation error (422)');
        throw { detail: 'Invalid ticket data. Please check your input.' };
      }
      if (error.response?.status === 404) {
        console.log('Endpoint not found (404)');
        throw { detail: 'API endpoint not found. Please check the server.' };
      }
      if (error.response?.status === 500) {
        console.log('Server error (500)');
        throw { detail: 'Server error. Please try again later.' };
      }
      if (!error.response) {
        console.log('Network error - no response received');
        throw { detail: 'Network error. Please check your connection.' };
      }
      throw error.response?.data || { detail: 'Failed to create ticket. Please try again.' };
    }
  },

  // Get all tickets
  getTickets: async (params = {}) => {
    try {
      console.log('Fetching tickets with params:', params);
      const response = await api.get('/api/tickets', { params });
      console.log('Tickets fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error.response?.data || { detail: 'Failed to fetch tickets' };
    }
  },

  // Get tickets for a specific user
  getUserTickets: async (userId, params = {}) => {
    try {
      console.log('Fetching tickets for user:', userId);
      const response = await api.get(`/api/tickets/user/${userId}`, { params });
      console.log('User tickets fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error.response?.data || { detail: 'Failed to fetch user tickets' };
    }
  },

  // Get a specific ticket
  getTicket: async (id) => {
    try {
      console.log('Fetching ticket with ID:', id);
      const response = await api.get(`/api/tickets/${id}`);
      console.log('Ticket fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error.response?.data || { detail: 'Failed to fetch ticket' };
    }
  },

  // Update a ticket
  updateTicket: async (id, ticketData) => {
    try {
      console.log('Updating ticket with ID:', id);
      console.log('Update data:', ticketData);
      const response = await api.put(`/api/tickets/${id}`, ticketData);
      console.log('Ticket updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        throw { detail: 'Authentication required. Please log in.' };
      }
      if (error.response?.status === 422) {
        throw { detail: 'Invalid ticket data. Please check your input.' };
      }
      if (error.response?.status === 404) {
        throw { detail: 'Ticket not found.' };
      }
      if (error.response?.status === 500) {
        throw { detail: 'Server error. Please try again later.' };
      }
      if (!error.response) {
        throw { detail: 'Network error. Please check your connection.' };
      }
      
      // If the error response has a detail message, use it
      if (error.response?.data?.detail) {
        throw { detail: error.response.data.detail };
      }
      
      // Default error message
      throw { detail: 'Failed to update ticket. Please try again.' };
    }
  },

  // Delete a ticket
  deleteTicket: async (id) => {
    try {
      console.log('Deleting ticket with ID:', id);
      const response = await api.delete(`/api/tickets/${id}`);
      console.log('Ticket deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error.response?.data || { detail: 'Failed to delete ticket' };
    }
  }
};

export default ticketService; 