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
    return response.data;
  },

  // Send connection request
  sendConnectionRequest: async (userId) => {
    const response = await axios.post(`${API_BASE_URL}/connections`, { userId });
    return response.data;
  },

  // Accept connection request
  acceptConnection: async (connectionId) => {
    const response = await axios.put(`${API_BASE_URL}/connections/${connectionId}/accept`);
    return response.data;
  },

  // Reject connection request
  rejectConnection: async (connectionId) => {
    const response = await axios.put(`${API_BASE_URL}/connections/${connectionId}/reject`);
    return response.data;
  },
};

export default userService;