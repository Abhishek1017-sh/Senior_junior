import { useState } from 'react';
import { FaBell, FaCheck, FaTimes, FaComments, FaClock } from 'react-icons/fa';
import useSessionNotifications from '../hooks/useSessionNotifications';
import useSocket from '../hooks/useSocket';

const SessionNotificationPanel = () => {
  const { socket } = useSocket();
  const { sessionRequests, acceptSession, declineSession, sendSessionMessage } = useSessionNotifications(socket);
  const [expandedSession, setExpandedSession] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleAccept = (sessionId) => {
    acceptSession(sessionId);
  };

  const handleDecline = (sessionId) => {
    declineSession(sessionId, 'Senior declined the session due to scheduling conflict');
  };

  const handleSendMessage = (sessionId) => {
    if (replyMessage.trim()) {
      sendSessionMessage(sessionId, replyMessage);
      setReplyMessage('');
    }
  };

  if (sessionRequests.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <div className="bg-white rounded-lg shadow-lg border border-blue-200">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center">
          <FaBell className="mr-2" />
          <h3 className="font-semibold">
            {sessionRequests.length} Session Request{sessionRequests.length !== 1 ? 's' : ''}
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {sessionRequests.map((request) => (
            <div key={request.sessionId} className="border-b p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <img
                      src={request.junior.profilePicture || '/default-avatar.png'}
                      alt={request.junior.firstName}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {request.junior.firstName} {request.junior.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{request.topic}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FaClock className="mr-1" />
                    {new Date(request.scheduledTime).toLocaleString()}
                  </div>

                  {request.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      "{request.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleAccept(request.sessionId)}
                  className="flex-1 flex items-center justify-center bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                >
                  <FaCheck className="mr-1" />
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(request.sessionId)}
                  className="flex-1 flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                >
                  <FaTimes className="mr-1" />
                  Decline
                </button>
              </div>

              {/* Message Reply */}
              <div className="mt-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSendMessage(request.sessionId)}
                    disabled={!replyMessage.trim()}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FaComments />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionNotificationPanel;
