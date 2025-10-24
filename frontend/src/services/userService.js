import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const userService = {
  // Get user profile by ID
  getUserProfile: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  },

  // Get all seniors with optional search
  getSeniors: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(`${API_BASE_URL}/users/seniors?${queryParams}`);
    return response.data;
  },

  // Search seniors by skills
  searchSeniors: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/users/seniors/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Get user connections
  getConnections: async () => {
    const response = await axios.get(`${API_BASE_URL}/connections`);
    return response.data.data || [];
  },

  // Get pending connection requests
  getPendingConnections: async () => {
    const response = await axios.get(`${API_BASE_URL}/connections/pending`);
    return response.data.data || [];
  },

  // Send connection request
  sendConnectionRequest: async (userId) => {
    const response = await axios.post(`${API_BASE_URL}/connections/request/${userId}`);
    return response.data;
  },

  // Accept connection request
  acceptConnectionRequest: async (juniorId) => {
    const response = await axios.post(`${API_BASE_URL}/connections/accept/${juniorId}`);
    return response.data;
  },

  // Reject connection request
  rejectConnectionRequest: async (juniorId) => {
    const response = await axios.post(`${API_BASE_URL}/connections/reject/${juniorId}`);
    return response.data;
  },

  // Remove connection
  removeConnection: async (connectionId) => {
    const response = await axios.delete(`${API_BASE_URL}/connections/${connectionId}`);
    return response.data;
  },
};

export default userService;