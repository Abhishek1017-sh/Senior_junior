import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUserPlus, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { useState } from 'react';

const SeniorCard = ({ senior, onConnectionUpdate, onUserUpdate, user: propUser }) => {
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser;
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus(null);
    try {
      await userService.sendConnectionRequest(senior._id);
      setConnectionStatus('success');
      if (onConnectionUpdate) {
        onConnectionUpdate();
      }
      if (onUserUpdate) {
        onUserUpdate({
          pendingConnections: [...(user?.pendingConnections || []), senior._id]
        });
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      setConnectionStatus('error');
      setConnectionErrorMessage(error.response?.data?.message || 'Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const isOwnProfile = user?._id === senior._id;
  const isConnected = user?.connections?.some(conn => conn.toString() === senior._id.toString());
  const hasPendingRequest = user?.pendingConnections?.some(conn => conn.toString() === senior._id.toString());
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={i} className="text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStar key="half" className="text-yellow-400 opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={senior.profile?.profilePicture || '/default-avatar.png'}
          alt={senior.username}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {senior.profile?.firstName} {senior.profile?.lastName}
          </h3>
          <p className="text-sm text-gray-600">@{senior.username}</p>

          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {renderStars(senior.averageRating || 0)}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              ({senior.reviewCount || 0} reviews)
            </span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-700 line-clamp-2">
              {senior.seniorProfile?.bio || 'No bio available'}
            </p>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {senior.seniorProfile?.skills?.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {senior.seniorProfile?.skills?.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{senior.seniorProfile.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <FaMapMarkerAlt className="inline mr-1" />
              {senior.profile?.location || 'Location not specified'}
            </div>

            <div className="flex space-x-2">
              {!isOwnProfile && !isConnected && !hasPendingRequest && (
                <div className="flex flex-col items-end">
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm flex items-center"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="mr-1" />
                        Connect
                      </>
                    )}
                  </button>
                  {connectionStatus === 'success' && (
                    <span className="text-green-600 text-xs mt-1 flex items-center">
                      <FaCheck className="mr-1" />
                      Request sent!
                    </span>
                  )}
                  {connectionStatus === 'error' && (
                    <span className="text-red-600 text-xs mt-1">
                      {connectionErrorMessage || 'Failed to connect'}
                    </span>
                  )}
                </div>
              )}

              {hasPendingRequest && !isConnected && (
                <div className="flex flex-col items-end">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm">
                    Request Pending
                  </span>
                </div>
              )}

              {isConnected && (
                <div className="flex flex-col items-end">
                  <Link
                    to={`/chat?recipient=${senior._id}`}
                    className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center"
                  >
                    <FaUserPlus className="mr-1" />
                    Message
                  </Link>
                  <span className="text-green-600 text-xs mt-1">Connected</span>
                </div>
              )}

              <Link
                to={`/profile/${senior._id}`}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorCard;