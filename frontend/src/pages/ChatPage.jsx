import { useState, useEffect } from 'react';
import { FaSearch, FaPaperPlane } from 'react-icons/fa';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import userService from '../services/userService';

const ChatPage = () => {
  const { user } = useAuth();
  const { sendMessage, joinChat, messages, isConnected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // In a real app, you'd fetch conversations from the API
      // For now, we'll use mock data
      const mockConversations = [
        {
          _id: '1',
          participant: {
            _id: 'user1',
            profile: { firstName: 'John', lastName: 'Doe' },
            username: 'johndoe',
          },
          lastMessage: {
            content: 'Thanks for the great session!',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          unreadCount: 1,
        },
        {
          _id: '2',
          participant: {
            _id: 'user2',
            profile: { firstName: 'Jane', lastName: 'Smith' },
            username: 'janesmith',
          },
          lastMessage: {
            content: 'Looking forward to our meeting',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          },
          unreadCount: 0,
        },
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    joinChat(conversation.participant._id);
  };

  const handleSendMessage = (content) => {
    if (selectedConversation) {
      sendMessage(selectedConversation.participant._id, content);
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.participant.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.participant.profile.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>

          {/* Search */}
          <div className="mt-3 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Connection Status */}
        <div className={`px-4 py-2 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={conversation.participant.profile?.profilePicture || '/default-avatar.png'}
                    alt={conversation.participant.profile.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.participant.profile.firstName} {conversation.participant.profile.lastName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </p>

                    {conversation.unreadCount > 0 && (
                      <span className="inline-block mt-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <FaPaperPlane className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 text-sm">
                Start a conversation by visiting a mentor's profile and clicking "Message".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            recipient={selectedConversation.participant}
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={false} // This would be managed by socket events
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FaPaperPlane className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">
                Choose a conversation from the sidebar to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
