import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const reviewService = {
  // Submit a review for a session
  submitReview: async (reviewData) => {
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData);
    return response.data;
  },

  // Get reviews for a senior (changed route on backend)
  getUserReviews: async (userId) => {
    // Avoid network calls in test environment when API base is not configured
    if (!API_BASE_URL) return { data: [] };

    const response = await axios.get(`${API_BASE_URL}/reviews/senior/${userId}`);
    return response.data;
  },

  // Get reviews for a session
  getSessionReviews: async (sessionId) => {
    const response = await axios.get(`${API_BASE_URL}/reviews/session/${sessionId}`);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
    return response.data;
  },
};

export default reviewService;