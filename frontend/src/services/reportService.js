import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || '';
  return { Authorization: token ? `Bearer ${token}` : '' };
};

const reportService = {
  submitReport: async (reportData) => {
    const response = await axios.post(`${API_BASE_URL}/reports`, reportData, { headers: getAuthHeaders() });
    return response.data;
  },
};

export default reportService;
