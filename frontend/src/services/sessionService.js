import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sessionService = {
  // Get user's sessions
  getUserSessions: async () => {
    const response = await axios.get(`${API_BASE_URL}/sessions`);
    return response.data;
  },

  // Book a new session
  bookSession: async (sessionData) => {
    const response = await axios.post(`${API_BASE_URL}/sessions/book`, sessionData);
    return response.data;
  },

  // Cancel a session
  cancelSession: async (sessionId) => {
    const response = await axios.put(`${API_BASE_URL}/sessions/${sessionId}/cancel`);
    return response.data;
  },

  // Confirm a session
  confirmSession: async (sessionId) => {
    const response = await axios.put(`${API_BASE_URL}/sessions/${sessionId}/confirm`);
    return response.data;
  },

  // Get session details
  getSessionDetails: async (sessionId) => {
    const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
    return response.data;
  },
};

export default sessionService;