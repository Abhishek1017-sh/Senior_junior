import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCheck, FaTimes, FaStar, FaComment } from 'react-icons/fa';
import sessionService from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import ReviewModal from '../components/ReviewModal';
import CancelSessionModal from '../components/CancelSessionModal';
import { formatDateTime } from '../utils/helpers';
import Container from '../components/Container';
import { SESSION_STATUS } from '../utils/constants';

const MySessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false); // FIX: Add cancel modal state
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

  const handleClearPastSessions = async () => {
    if (!confirm('Are you sure you want to permanently clear past sessions older than 30 days?')) return;
    try {
      await sessionService.clearPastSessions();
      // Refresh sessions after clearing
      await fetchSessions();
      alert('Past sessions cleared successfully.');
    } catch (error) {
      console.error('Error clearing past sessions:', error);
      alert('Failed to clear past sessions');
    }
  };

  // FIX: Update cancel session handler
  const handleCancelSession = async (sessionId) => {
    const session = sessions.find(s => s._id === sessionId);
    setSelectedSession(session);
    setCancelModalOpen(true);
  };

  // FIX: Handle cancel session with reason
  const handleConfirmCancel = async (reason) => {
    try {
      await sessionService.cancelSession(selectedSession._id, { reason });
      fetchSessions(); // Refresh sessions to show updated data with reason
      setCancelModalOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error cancelling session:', error);
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
    <Container>
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
            <div className="ml-auto mr-4 flex items-center">
              <button
                onClick={handleClearPastSessions}
                className="text-sm px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear Past Sessions
              </button>
            </div>
          </nav>
        </div>

        {/* Sessions List */}
        <div className="p-6">
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session._id} className="border rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Determine which user to show (other participant). If the current logged-in user is the senior
                            show the junior details; otherwise show the senior details. */}
                        {(() => {
                          const currentUserId = user?._id;
                          const isViewingAsSenior = String(currentUserId) === String(session.seniorId?._id || session.seniorId);
                          const participant = isViewingAsSenior ? session.juniorId : session.seniorId;
                          return (
                            <img
                              src={participant?.profile?.profilePictureUrl || participant?.profile?.profilePicture || '/default-avatar.png'}
                              alt={participant?.profile?.firstName || 'participant'}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          );
                        })()}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {(() => {
                              const currentUserId = user?._id;
                              const isViewingAsSenior = String(currentUserId) === String(session.seniorId?._id || session.seniorId);
                              const participant = isViewingAsSenior ? session.juniorId : session.seniorId;
                              const first = participant?.profile?.firstName || participant?.username || 'Unknown';
                              const last = participant?.profile?.lastName || '';
                              return `Session with ${first} ${last}`;
                            })()}
                          </h3>
                          <p className="text-gray-600">{session.topic}</p>

                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              {formatDateTime(session.scheduledTime)}
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-1" />
                              {session.duration || '60'} minutes
                            </div>
                          </div>

                          {session.notes && (
                            <p className="text-gray-600 mt-2 text-sm">
                              {session.notes}
                            </p>
                          )}

                          {/* FIX: Show cancellation reason if session is cancelled */}
                          {session.status === SESSION_STATUS.CANCELLED && session.cancellationReason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-start space-x-2">
                                <FaComment className="text-red-600 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-red-900">
                                                          Cancellation Reason ({session.cancelledBy === 'senior' ? 'Senior' : 'You'})
                                  </p>
                                  <p className="text-sm text-red-700 mt-1">
                                    {session.cancellationReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>

                      {activeTab === 'upcoming' && session.status === SESSION_STATUS.PENDING && (String(user?._id) === String(session.seniorId?._id || session.seniorId) ? (
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
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCancelSession(session._id)}
                              className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                            >
                              <FaTimes />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ))}

                      {activeTab === 'upcoming' && session.status === SESSION_STATUS.CONFIRMED && (
                        <button
                          onClick={() => handleCancelSession(session._id)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                        >
                          <FaTimes />
                          <span>Cancel</span>
                        </button>
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

      {/* Cancel Session Modal */}
      <CancelSessionModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedSession(null);
        }}
        onConfirm={handleConfirmCancel}
        sessionTitle={selectedSession ? `${selectedSession.topic} with ${(() => {
          const currentUserId = user?._id;
          const isViewingAsSenior = String(currentUserId) === String(selectedSession.seniorId?._id || selectedSession.seniorId);
          const participant = isViewingAsSenior ? selectedSession.juniorId : selectedSession.seniorId;
          return participant?.profile?.firstName || participant?.username || 'Unknown';
        })()}` : ''}
      />

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
    </Container>
  );
};

export default MySessionsPage;