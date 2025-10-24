import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({ recipient, messages, onSendMessage, isTyping, onBack }) => {
  console.log('ChatWindow rendered with recipient:', recipient, 'messages:', messages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('ChatWindow messages updated:', messages);
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && recipient) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 md:hidden text-white hover:text-blue-100"
            >
              <FaArrowLeft />
            </button>
          )}
          <div>
            <h3 className="text-lg font-semibold">
              Chat with {recipient?.profile?.firstName} {recipient?.profile?.lastName}
            </h3>
            <p className="text-sm opacity-90">@{recipient?.username}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages
            .filter(message => message && message._id) // Filter out undefined messages and messages without _id
            .map((message) => {
              // Normalize sender and user ids to strings for reliable comparison
              const senderId = message?.senderId?._id || message?.senderId?.id || message?.senderId || message?.sender;
              const userId = user?._id || user?.id;
              const isOwn = userId && senderId && String(senderId) === String(userId);

              return (
                <div key={message._id} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    <p className="text-sm">{message.message || message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp ? formatTime(message.timestamp) : formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <FaPaperPlane className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;