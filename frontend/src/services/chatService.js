import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const chatService = {
  // Get user's chat conversations
  getConversations: async () => {
    const response = await axios.get(`${API_BASE_URL}/chat/conversations`);
    return response.data.data || [];
  },

  // Get messages for a specific conversation
  getMessages: async (recipientId) => {
    const response = await axios.get(`${API_BASE_URL}/chat/messages/${recipientId}`);
    return response.data.data || [];
  },

  // Send a message
  sendMessage: async (recipientId, content) => {
    const response = await axios.post(`${API_BASE_URL}/chat/messages`, {
      recipientId,
      content,
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (senderId) => {
    const response = await axios.put(`${API_BASE_URL}/chat/messages/read/${senderId}`);
    return response.data;
  },
};

export default chatService;