import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaCalendarAlt, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaEnvelope, FaComments, FaUserPlus, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import sessionService from '../services/sessionService';
import reviewService from '../services/reviewService';
import SessionBookingModal from '../components/SessionBookingModal';
import ReviewModal from '../components/ReviewModal';
import { formatDate, maskEmail, maskString } from '../utils/helpers';
import Container from '../components/Container';
import { USER_ROLES } from '../utils/constants';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, refetchUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSessionsWithUser, setCompletedSessionsWithUser] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localOverride, setLocalOverride] = useState(null); // NEW
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getUserProfile(userId);
      setUser(response.data);
      // fetch reviews for this senior
      try {
        const reviewsRes = await reviewService.getUserReviews(userId);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch reviews for user:', err);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  
  // Fetch completed sessions between current user and the viewed profile
  const fetchCompletedSessions = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await sessionService.getUserSessions();
      const mySessions = res.data || [];
      const filtered = mySessions.filter(s => (
        (String(s.seniorId?._id || s.seniorId) === String(userId) || String(s.juniorId?._id || s.juniorId) === String(userId))
      ) && s.status === 'completed');
      setCompletedSessionsWithUser(filtered);
    } catch (err) {
      console.error('Error fetching related sessions:', err);
    }
  }, [currentUser, userId]);

  useEffect(() => {
    fetchUserProfile();
    fetchCompletedSessions();
  }, [userId, fetchUserProfile, fetchCompletedSessions]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewService.submitReview(reviewData);
      // Refresh the profile to update rating and counts
      await fetchUserProfile();
      setReviewModalOpen(false);
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };


  // Check connection status whenever currentUser or userId changes
  useEffect(() => {
    if (currentUser && userId) {
      const connected = currentUser?.connections?.some(conn => {
        const connId = typeof conn === 'string' ? conn : conn._id || conn;
        return String(connId) === String(userId);
      }) || false;

      // Check pending by verifying if the viewed user's pendingConnections includes current user's id
      const pendingFromUser = user?.pendingConnections?.some(conn => {
        const connId = typeof conn === 'string' ? conn : conn._id || conn;
        return String(connId) === String(currentUser?._id);
      }) || false;

      // For backward compatibility, also check current user's pending list
      const pending = currentUser?.pendingConnections?.some(conn => {
        const connId = typeof conn === 'string' ? conn : conn._id || conn;
        return String(connId) === String(userId);
      }) || false;

      // prefer override while it's set
      if (localOverride === 'pending') {
        setConnectionStatus('pending');
      } else {
        setIsConnected(connected);
        if (pending || pendingFromUser) setConnectionStatus('pending');
      }
    }
  }, [currentUser, userId, localOverride, user?.pendingConnections]);

  const handleBookSession = () => {
    setShowBookingModal(true);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus(null);

    try {
      if (!user || !user._id) {
        setConnectionStatus('error');
        return;
      }

      if (user.role !== 'senior' && user.role !== 'both') {
        setConnectionStatus('error');
        return;
      }

      // send request
      await userService.sendConnectionRequest(user._id);
      setConnectionStatus('pending');
      await refetchUser();
      // refresh target profile so we see pending from server
      const prof = await userService.getUserProfile(userId);
      setUser(prof.data);
      setLocalOverride(null);
    } catch (error) {
      const msg = error?.response?.data?.message;
      // map server messages to UI
      if (msg === 'Connection request already sent') {
        // server recorded request on senior; junior should see "Requested"
        setLocalOverride('pending'); // keep override until refetch verifies
        await refetchUser();
        const prof2 = await userService.getUserProfile(userId);
        setUser(prof2.data);
      } else if (msg === 'Connection already exists') {
        setIsConnected(true);
        await refetchUser();
        const prof3 = await userService.getUserProfile(userId);
        setUser(prof3.data);
        setLocalOverride(null);
      } else {
        setConnectionStatus('error');
      }
    } finally {
      setIsConnecting(false);
    }
  };

    const handleWithdraw = async () => {
      if (!user) return;
      try {
        await userService.withdrawConnectionRequest(user._id);
        setConnectionStatus(null);
        await refetchUser();
        // refresh profile even on error to update pending state
        const prof4 = await userService.getUserProfile(userId);
        setUser(prof4.data);
      } catch (err) {
        console.error('Failed to withdraw connection request', err);
        // If error, still refresh UI
        try {
          await refetchUser();
          const prof5 = await userService.getUserProfile(userId);
          setUser(prof5.data);
        } catch (e) {
          console.error('Failed to refresh after withdraw error', e);
        }
      }
    };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-yellow-400 opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
        <p className="text-gray-600">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;
  const isJunior = currentUser?.role === USER_ROLES.JUNIOR || currentUser?.role === USER_ROLES.BOTH;
  const canBookSession = !isOwnProfile && isJunior && user.role !== USER_ROLES.JUNIOR;

    return (
      <Container className="max-w-4xl">
        <div className="space-y-6">
      {/* Profile Header */}
      <div className="card-surface rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={user.profile?.profilePictureUrl || '/default-avatar.png'}
            alt={`${user.profile?.firstName} ${user.profile?.lastName}`}
            className="w-24 h-24 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.profile?.firstName} {user.profile?.lastName}
                </h1>
                <p className="text-gray-600">@{user.username}</p>

                <div className="flex items-center mt-2">
                  <div className="flex items-center mr-4">
                    {renderStars(user.averageRating || 0)}
                  </div>
                  <span className="text-gray-600">
                    ({user.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 mt-4 md:mt-0">
                {isOwnProfile && (
                  <Link
                    to="/edit-profile"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </Link>
                )}

                {canBookSession && (
                  <div className="flex flex-col items-start">
                    <button
                      onClick={handleBookSession}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      <FaCalendarAlt className="inline mr-2" />
                      Book Session
                    </button>
                    {bookingStatus === 'success' && (
                      <span className="text-green-600 text-sm mt-1 flex items-center">
                        <FaCheck className="mr-1" />
                        Session booked!
                      </span>
                    )}
                    {bookingStatus === 'error' && (
                      <span className="text-red-600 text-sm mt-1">
                        Failed to book session
                      </span>
                    )}
                  </div>
                )}

                {/* Show appropriate button based on connection status */}
                {!isOwnProfile && !isConnected && (user.role === USER_ROLES.SENIOR || user.role === USER_ROLES.BOTH) && (
                  <div className="flex flex-col items-start">
                    <button
                          onClick={handleConnect}
                      disabled={isConnecting || connectionStatus === 'pending'}
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="inline mr-2" />
                            {connectionStatus === 'pending' ? 'Requested' : 'Connect'}
                        </>
                      )}
                    </button>
                    {connectionStatus === 'pending' && (
                      <span className="text-yellow-600 text-sm mt-1">
                        Request Pending
                      </span>
                    )}
                    {connectionStatus === 'pending' && (
                      <button onClick={handleWithdraw} className="text-red-600 text-sm mt-1">
                        Withdraw Request
                      </button>
                    )}
                    {connectionStatus === 'success' && (
                      <span className="text-green-600 text-sm mt-1 flex items-center">
                        <FaCheck className="mr-1" />
                        Request sent!
                      </span>
                    )}
                    {connectionStatus === 'error' && (
                      <span className="text-red-600 text-sm mt-1">
                        Failed to send connection request
                      </span>
                    )}
                  </div>
                )}

                {/* Show Message button when already connected */}
                {!isOwnProfile && isConnected && (
                  <Link
                    to="/chat"
                    state={{ recipient: user }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                  >
                    <FaComments className="inline mr-2" />
                    Message
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>

            {user.profile?.bio ? (
              <p className="text-gray-700 leading-relaxed">{user.profile.bio}</p>
            ) : (
              <p className="text-gray-500 italic">No bio available</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <span>
                  {isOwnProfile
                    ? (user.profile?.location || 'Location not specified')
                    : (user.profile?.location
                        ? (user.profile.location.includes('*') ? user.profile.location : maskString(user.profile.location, { showFirst: 2 }))
                        : 'Location not specified')}
                </span>
                {!isOwnProfile && (
                  <span className="text-xs text-gray-400 ml-2">(Private)</span>
                )}
              </div>

              <div className="flex items-center text-gray-600">
                <FaEnvelope className="mr-2" />
                <span>{isOwnProfile ? user.email : maskEmail(user.email)}</span>
                {!isOwnProfile && (
                  <span className="text-xs text-gray-400 ml-2">(Private)</span>
                )}
              </div>
            </div>

            {/* Interests */}
            {user.profile?.interests && user.profile.interests.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.interests.map((interest, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          {user.seniorProfile?.skills && user.seniorProfile.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {user.seniorProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{review.reviewerId?.profile?.firstName || review.reviewerId?.username}</h3>
                        <p className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                        <div className="mt-2 text-sm text-gray-700">{review.comment}</div>
                      </div>
                      <div className="text-yellow-500 text-lg font-bold">{review.rating}★</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet. Be the first to leave one after a completed session.</p>
            )}
          </div>

          {/* Experience */}
          {user.seniorProfile?.experience && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="flex items-center text-gray-600">
                <FaBriefcase className="mr-2" />
                <span>{user.seniorProfile.experience} years</span>
              </div>
            </div>
          )}

          {/* Education */}
          {user.seniorProfile?.education && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
              <div className="flex items-center text-gray-600">
                <FaGraduationCap className="mr-2" />
                <span>{user.seniorProfile.education}</span>
              </div>
            </div>
          )}

          {/* Projects */}
          {user.seniorProfile?.projects && user.seniorProfile.projects.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notable Projects</h2>
              <div className="space-y-3">
                {user.seniorProfile.projects.map((project, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-gray-600 text-sm">{project.description}</p>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability */}
          {user.seniorProfile?.availability && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
              <div className="space-y-2">
                {user.seniorProfile.availability.map((slot, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2 text-green-500" />
                    <span>
                      {typeof slot === 'string'
                        ? slot
                        : slot.label || (slot.days ? `${slot.days.join(', ')} ${slot.start || ''}${slot.start && slot.end ? ' - ' : ''}${slot.end || ''}` : JSON.stringify(slot))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allow rating (if we have a completed session link) */}
          {completedSessionsWithUser.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rate this mentor</h2>
              <div className="text-sm text-gray-600">
                <p>You've had sessions with this mentor — leave a rating for a session below.</p>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="mt-3 inline-block bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Leave a Review
                </button>
              </div>
            </div>
          )}

          {/* If no completed sessions, add a hint on how to leave a review */}
          {completedSessionsWithUser.length === 0 && !isOwnProfile && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <p className="text-gray-600">You can leave a review after you have completed a session with this mentor. Go to <strong>My Sessions</strong> and leave a review for a completed session.</p>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions Completed</span>
                <span className="font-semibold">{user.completedSessions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold">{(user.averageRating || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">Reviews</span>
                <span className="font-semibold">{user.reviewCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Booking Modal */}
      <SessionBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        senior={user}
        onSuccess={() => {
          setBookingStatus('success');
          setShowBookingModal(false);
        }}
      />
      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        sessions={completedSessionsWithUser}
      />
      </div>
    </Container>
  );
};

export default ProfilePage;
