import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCheck, FaTimes, FaStar } from 'react-icons/fa';
import sessionService from '../services/sessionService';
import reviewService from '../services/reviewService';
import ReviewModal from '../components/ReviewModal';
import { formatDateTime } from '../utils/helpers';
import { SESSION_STATUS } from '../utils/constants';

const MySessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionService.getUserSessions();
      setSessions(response.data); // <-- Extract the 'data' property
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        await sessionService.cancelSession(sessionId);
        fetchSessions(); // Refresh sessions
      } catch (error) {
        console.error('Error canceling session:', error);
      }
    }
  };

  const handleConfirmSession = async (sessionId) => {
    try {
      await sessionService.confirmSession(sessionId);
      fetchSessions(); // Refresh sessions
    } catch (error) {
      console.error('Error confirming session:', error);
    }
  };

  const handleLeaveReview = (session) => {
    setSelectedSession(session);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewService.submitReview(reviewData);
      fetchSessions(); // Refresh sessions
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const filterSessions = () => {
    const now = new Date();

    if (activeTab === 'upcoming') {
      return sessions.filter(session =>
        new Date(session.scheduledTime) > now &&
        session.status !== SESSION_STATUS.CANCELLED
      );
    } else if (activeTab === 'past') {
      return sessions.filter(session =>
        new Date(session.scheduledTime) <= now ||
        session.status === SESSION_STATUS.COMPLETED ||
        session.status === SESSION_STATUS.CANCELLED
      );
    }

    return sessions;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case SESSION_STATUS.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case SESSION_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case SESSION_STATUS.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case SESSION_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = filterSessions();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
        <p className="text-gray-600">
          Manage your mentorship sessions and bookings.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming Sessions
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Past Sessions
            </button>
          </nav>
        </div>

        {/* Sessions List */}
        <div className="p-6">
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session._id} className="border rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <img
                          src={session.senior?.profile?.profilePicture || '/default-avatar.png'}
                          alt={session.senior?.profile?.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                        />

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Session with {session.senior?.profile?.firstName} {session.senior?.profile?.lastName}
                          </h3>
                          <p className="text-gray-600">{session.topic}</p>

                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              {formatDateTime(session.scheduledDate)}
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-1" />
                              {session.duration || '60'} minutes
                            </div>
                          </div>

                          {session.description && (
                            <p className="text-gray-600 mt-2 text-sm">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>

                      {activeTab === 'upcoming' && session.status === SESSION_STATUS.PENDING && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleConfirmSession(session._id)}
                            className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                          >
                            <FaCheck />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleCancelSession(session._id)}
                            className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                          >
                            <FaTimes />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}

                      {activeTab === 'past' && session.status === SESSION_STATUS.COMPLETED && (
                        <button
                          onClick={() => handleLeaveReview(session)}
                          className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                        >
                          <FaStar />
                          <span>Leave Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No {activeTab} sessions
              </h3>
              <p className="text-gray-600">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming sessions scheduled."
                  : "You haven't completed any sessions yet."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedSession(null);
        }}
        onSubmit={handleReviewSubmit}
        sessionId={selectedSession?._id}
      />
    </div>
  );
};

export default MySessionsPage;