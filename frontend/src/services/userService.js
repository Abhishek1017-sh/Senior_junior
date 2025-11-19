import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || '';
  return { Authorization: token ? `Bearer ${token}` : '' };
};

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
    const response = await axios.get(`${API_BASE_URL}/connections`, { headers: getAuthHeaders() });
    return response.data.data || [];
  },

  // Get pending connection requests
  getPendingConnections: async () => {
    const response = await axios.get(`${API_BASE_URL}/connections/pending`, { headers: getAuthHeaders() });
    return response.data.data || [];
  },

  // Withdraw a previously sent connection request
  withdrawConnectionRequest: async (seniorId) => {
    const response = await axios.delete(`${API_BASE_URL}/connections/withdraw/${seniorId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Send connection request
  sendConnectionRequest: async (userId) => {
    const response = await axios.post(
      `${API_BASE_URL}/connections/request/${userId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Accept connection request
  acceptConnectionRequest: async (juniorId) => {
    const response = await axios.post(`${API_BASE_URL}/connections/accept/${juniorId}`, {}, { headers: getAuthHeaders() });
    return response.data;
  },

  // Reject connection request
  rejectConnectionRequest: async (juniorId) => {
    const response = await axios.post(`${API_BASE_URL}/connections/reject/${juniorId}`, {}, { headers: getAuthHeaders() });
    return response.data;
  },

  // Remove connection
  removeConnection: async (connectionId) => {
    const response = await axios.delete(`${API_BASE_URL}/connections/${connectionId}`, { headers: getAuthHeaders() });
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await axios.post(`${API_BASE_URL}/users/profile/picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() },
    });
    return response.data;
  },
  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await axios.delete(`${API_BASE_URL}/users/profile/picture`, { headers: getAuthHeaders() });
    return response.data;
  },
};

export default userService;