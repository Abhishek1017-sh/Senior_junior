import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaPaperPlane } from 'react-icons/fa';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import chatService from '../services/chatService';
import userService from '../services/userService';

const ChatPage = () => {
  const { user } = useAuth();
  const [initialUnreadCounts, setInitialUnreadCounts] = useState(new Map());
  const { sendMessage, joinChat, messages, isConnected, unreadCounts, markMessagesAsRead } = useSocket(initialUnreadCounts);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Use a ref to ensure fetch only runs once on initial mount
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    console.log('fetchInitialData called');
    setLoading(true);
    try {
      // Fetch both conversations and connections in parallel
      console.log('Fetching conversations and connections...');
      const [chatRes, connRes] = await Promise.all([
        chatService.getConversations(),
        userService.getConnections()
      ]);

      console.log('Chat response:', chatRes);
      console.log('Connections response:', connRes);

      const chatConversations = chatRes || [];
      const connections = connRes || [];

      console.log('Chat conversations:', chatConversations);
      console.log('Connections:', connections);

      // Create a map of all potential chat partners (from both lists)
      const conversationMap = new Map();

      // Add actual conversations first, as they have real last messages
      chatConversations.forEach(convo => {
        conversationMap.set(convo.participant._id, {
          ...convo,
          unreadCount: convo.unreadCount || 0,
        });
      });

      // Add any connections that are not already in the conversation list
      connections.forEach(connection => {
        if (!conversationMap.has(connection._id)) {
          conversationMap.set(connection._id, {
            _id: connection._id,
            participant: {
              _id: connection._id,
              username: connection.username,
              profile: connection.profile,
              role: connection.role,
              seniorProfile: connection.seniorProfile
            },
            lastMessage: { content: 'Click to start chatting...', createdAt: new Date(0) },
            unreadCount: 0,
          });
        }
      });

      const combinedList = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

      // Set initial unread counts from server
      const serverUnreadCounts = new Map();
      combinedList.forEach(convo => {
        if (convo.unreadCount > 0) {
          serverUnreadCounts.set(convo.participant._id, convo.unreadCount);
        }
      });
      setInitialUnreadCounts(serverUnreadCounts);

      setConversations(combinedList);

      // --- NEW LOGIC: Handle incoming recipient AFTER conversations are loaded ---
      const newRecipient = location.state?.recipient;
      if (newRecipient) {
        const targetConvo = combinedList.find(c => c.participant._id === newRecipient._id);
        if (targetConvo) {
          handleSelectConversation(targetConvo);
        } else {
          // If the connection doesn't exist yet, we can't chat.
          // This can happen if the 'connect' button wasn't clicked.
          // For now, we'll just show the list. A better UX would be to auto-connect.
          console.warn("Attempted to chat with a user you are not connected to.");
        }
        // Clear the location state so it doesn't trigger again on re-render
        navigate(location.pathname, { replace: true });
      }

    } catch (error) {
      console.error('Error fetching initial chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    console.log('Selecting conversation:', conversation);
    if (conversation?.participant?._id) {
      setSelectedConversation(conversation);
      joinChat(conversation.participant._id);
      markMessagesAsRead(conversation.participant._id);
      
      // Mark messages as read on server
      try {
        await chatService.markAsRead(conversation.participant._id);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
      
      console.log('Selected conversation set:', conversation.participant._id);
    } else {
      console.error('Invalid conversation object:', conversation);
    }
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
    if (!date) return '';
    const messageDate = new Date(date);
    if (isNaN(messageDate)) return ''; // Invalid date check
  
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
  
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar - Hidden on mobile when chat is selected */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              onClick={fetchInitialData}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Refresh conversations"
            >
              ↻
            </button>
          </div>
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
        <div className={`px-4 py-2 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.participant?._id === conversation.participant._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={conversation.participant.profile?.profilePictureUrl || '/default-avatar.png'}
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
                    {unreadCounts.get(conversation.participant._id) > 0 && (
                      <span className="inline-block mt-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCounts.get(conversation.participant._id)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FaPaperPlane className="text-4xl mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
              <p className="text-sm">
                Connect with mentors on the "Find Seniors" page to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Chat Window - Full width on mobile when selected, flex-1 on desktop */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col`}>
        {selectedConversation ? (
          <ChatWindow
            recipient={selectedConversation.participant}
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={false}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <FaPaperPlane className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p>
                Choose someone from the sidebar to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;