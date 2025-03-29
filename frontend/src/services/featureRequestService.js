import api from '../api';

const featureRequestService = {
  // Get all feature requests
  getAll: async (params = {}) => {
    try {
      console.log('Fetching feature requests with params:', params);
      const response = await api.get('/api/feature-requests', { params });
      console.log('Feature requests fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      throw error.response?.data || { detail: 'Failed to fetch feature requests' };
    }
  },

  // Get a specific feature request
  getById: async (id) => {
    try {
      console.log('Fetching feature request with ID:', id);
      const response = await api.get(`/api/feature-requests/${id}`);
      console.log('Feature request fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching feature request:', error);
      throw error.response?.data || { detail: 'Failed to fetch feature request' };
    }
  },

  // Create a new feature request
  create: async (requestData) => {
    try {
      console.log('Creating feature request with data:', requestData);
      const response = await api.post('/api/feature-requests', requestData);
      console.log('Feature request created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating feature request:', error);
      throw error.response?.data || { detail: 'Failed to create feature request' };
    }
  },

  // Update a feature request
  update: async (id, requestData) => {
    try {
      console.log('Updating feature request with ID:', id);
      console.log('Update data:', requestData);
      const response = await api.put(`/api/feature-requests/${id}`, requestData);
      console.log('Feature request updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating feature request:', error);
      throw error.response?.data || { detail: 'Failed to update feature request' };
    }
  },

  // Delete a feature request
  delete: async (id) => {
    try {
      console.log('Deleting feature request with ID:', id);
      const response = await api.delete(`/api/feature-requests/${id}`);
      console.log('Feature request deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting feature request:', error);
      throw error.response?.data || { detail: 'Failed to delete feature request' };
    }
  },

  // Upvote a feature request
  upvote: async (id) => {
    try {
      console.log('Upvoting feature request with ID:', id);
      const response = await api.post(`/api/feature-requests/${id}/upvote`);
      console.log('Feature request upvoted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error upvoting feature request:', error);
      throw error.response?.data || { detail: 'Failed to upvote feature request' };
    }
  },

  // Add a comment to a feature request
  addComment: async (requestId, comment) => {
    try {
      console.log('Adding comment to feature request:', requestId);
      const response = await api.post(`/api/feature-requests/${requestId}/comments`, comment);
      console.log('Comment added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error.response?.data || { detail: 'Failed to add comment' };
    }
  },

  // Get comments for a feature request
  getComments: async (requestId) => {
    try {
      console.log('Fetching comments for feature request:', requestId);
      const response = await api.get(`/api/feature-requests/${requestId}/comments`);
      console.log('Comments fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error.response?.data || { detail: 'Failed to fetch comments' };
    }
  }
};

export default featureRequestService; 