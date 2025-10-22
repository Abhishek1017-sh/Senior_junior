import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  },

  // OAuth login URLs
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
  getGithubAuthUrl: () => `${API_BASE_URL}/auth/github`,

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData);
    return response.data;
  },
};

export default authService;