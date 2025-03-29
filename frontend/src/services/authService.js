import { auth } from '../api';
import api from '../api';

const authService = {
  async login(email, password) {
    try {
      // Create URLSearchParams for form data
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // Log the data being sent
      console.log('Sending login data:', {
        username: email,
        password: '***'
      });

      const response = await auth.login(formData);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      return response.data;
    } catch (error) {
      // Log the error details
      console.error('Login error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  async register(userData) {
    try {
      // Format data according to backend schema
      const registerData = {
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password
      };

      // Log the data being sent
      console.log('Sending registration data:', registerData);

      const response = await auth.register(registerData);
      return response.data;
    } catch (error) {
      // Log the error details
      console.error('Registration error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  async logout() {
    try {
      // Clear the auth header first
      this.setAuthHeader(null);
      
      // Clear all stored data
      localStorage.clear();
      
      // Try to call the backend logout endpoint if it exists
      try {
        await auth.logout();
      } catch (apiError) {
        // Ignore API errors during logout
        console.log('Backend logout failed:', apiError);
      }
      
      return true;
    } catch (error) {
      // Ensure cleanup even if something fails
      this.setAuthHeader(null);
      localStorage.clear();
      return true; // Return true to indicate successful cleanup
    }
  },

  async getProfile() {
    try {
      const response = await auth.getProfile();
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Helper function to check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Helper function to get token
  getToken() {
    return localStorage.getItem('token');
  },

  // Helper function to set auth header
  setAuthHeader(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }
};

export default authService; 