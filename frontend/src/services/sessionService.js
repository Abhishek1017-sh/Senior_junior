import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sessionService = {
  // Get user's sessions
  getUserSessions: async () => {
    // In test environments we may not have an API base URL set. Short-circuit
    // to avoid making real network requests during unit tests (prevents
    // noisy jsdom XHR errors and large console output that can contribute
    // to worker memory pressure).
    if (!API_BASE_URL) return { data: [] };

    const response = await axios.get(`${API_BASE_URL}/sessions`);
    return response.data;
  },

  // Book a new session
  bookSession: async (sessionData) => {
    const response = await axios.post(`${API_BASE_URL}/sessions/book`, sessionData);
    return response.data;
  },

  // Cancel a session
  cancelSession: async (sessionId, data = {}) => {
    const response = await axios.put(
      `${API_BASE_URL}/sessions/${sessionId}/cancel`,
      { reason: data.reason || '' } // Explicitly pass reason
    );
    return response.data;
  },

  // Clear past sessions for logged-in user
  clearPastSessions: async (days = null) => {
    const query = days ? `?days=${days}` : '';
    const response = await axios.delete(`${API_BASE_URL}/sessions/clear-past${query}`);
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