import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaCalendarAlt, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaEnvelope, FaComments, FaUserPlus, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import sessionService from '../services/sessionService';
import SessionBookingModal from '../components/SessionBookingModal';
import { formatDate } from '../utils/helpers';
import { USER_ROLES } from '../utils/constants';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userService.getUserProfile(userId);
        setUser(response.data); // <-- Extract the 'data' property
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleBookSession = () => {
    setShowBookingModal(true);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus(null);
    try {
      await userService.sendConnectionRequest(userId);
      setConnectionStatus('success');
      // Refresh the user data to show updated connection status
      const response = await userService.getUserProfile(userId);
      setUser(response.data);
    } catch (error) {
      console.error('Error sending connection request:', error);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
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
  const isConnected = currentUser?.connections?.includes(userId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={user.profile?.profilePicture || '/default-avatar.png'}
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
                        Session booked! Check "My Sessions"
                      </span>
                    )}
                    {bookingStatus === 'error' && (
                      <span className="text-red-600 text-sm mt-1">
                        Failed to book session
                      </span>
                    )}
                  </div>
                )}

                {!isOwnProfile && !isConnected && (user.role === USER_ROLES.SENIOR || user.role === USER_ROLES.BOTH) && (
                  <div className="flex flex-col items-start">
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
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
                          Connect
                        </>
                      )}
                    </button>
                    {connectionStatus === 'success' && (
                      <span className="text-green-600 text-sm mt-1 flex items-center">
                        <FaCheck className="mr-1" />
                        Connection request sent!
                      </span>
                    )}
                    {connectionStatus === 'error' && (
                      <span className="text-red-600 text-sm mt-1">
                        Failed to send connection request
                      </span>
                    )}
                  </div>
                )}

                {!isOwnProfile && isConnected && (
                  <Link
                    to={`/chat`}
                    state={{ recipient: user }} // <-- ADD THIS STATE PROP
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
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

            {user.seniorProfile?.bio ? (
              <p className="text-gray-700 leading-relaxed">{user.seniorProfile.bio}</p>
            ) : (
              <p className="text-gray-500 italic">No bio available</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <span>{user.profile?.location || 'Location not specified'}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <FaEnvelope className="mr-2" />
                <span>{user.email}</span>
              </div>
            </div>
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
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default ProfilePage;
