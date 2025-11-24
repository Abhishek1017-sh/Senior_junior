import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

import ReportModal from './ReportModal';
import reportService from '../services/reportService';

const ChatWindow = ({ recipient, messages, onSendMessage, isTyping, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && recipient) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  // Report modal / menu state
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleReportSubmit = async ({ reason, description }) => {
    // Prepare a snippet of the last 10 messages for context
    const chatContext = (messages || []).slice(-10).map((msg) => ({
      sender: (msg?.senderId?.username || msg?.senderId || msg?.sender || 'unknown'),
      message: msg?.message || msg?.content || '',
      timestamp: msg?.timestamp || msg?.createdAt || new Date(),
    }));

    const reportData = {
      reportedUserId: recipient?._id || recipient?.id,
      reason,
      description,
      chatContext,
    };

    try {
      await reportService.submitReport(reportData);
      // friendly feedback
      // eslint-disable-next-line no-alert
      alert('Report submitted successfully. Thank you — our moderators will review it.');
    } catch (err) {
      console.error('Failed to submit report', err);
      // eslint-disable-next-line no-alert
      alert('Failed to submit report. Please try again later.');
    }
  };

  const formatTime = (timestamp) => {
    const ts = timestamp || message?.createdAt;
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d)) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
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
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-blue-700">
              <FaEllipsisV />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 text-left">
                <button
                  onClick={() => { setReportModalOpen(true); setShowMenu(false); }}
                  className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Report User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages
            .filter(message => message && (message._id || message.localTempId))
            .map((message) => {
              const senderId = message?.senderId?._id || message?.senderId || message?.sender;
              const userId = user?._id || user?.id;
              const isOwn = userId && senderId && String(senderId) === String(userId);

              return (
                <div key={message._id || message.localTempId} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    <p className="text-sm">{message.message || message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp || message.createdAt)}
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

      {/* Report modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUser={recipient}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default ChatWindow;