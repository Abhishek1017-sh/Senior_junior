import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUserPlus, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { useState, useEffect } from 'react';

import { maskString } from '../utils/helpers';

const SeniorCard = ({ senior, onConnectionUpdate, onUserUpdate }) => {
  const { user, refetchUser } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [localConnectionState, setLocalConnectionState] = useState('none');
  const [localOverride, setLocalOverride] = useState(null); // NEW: hold temporary pending override

  // FIX: Recalculate state whenever user or senior changes
  useEffect(() => {
    if (user && senior) {
      // FIX: Check connections array for existing connection
      const isConnected = user?.connections?.some(
        conn => {
          const connId = typeof conn === 'string' ? conn : conn._id || conn;
          const seniorId = typeof senior._id === 'string' ? senior._id : String(senior._id);
          return String(connId) === seniorId;
        }
      );

      // FIX: Check pending connections array on the senior side — if the senior's pending list
      // contains the current user's id, then the current user has sent a request that is pending.
      const hasPendingRequest = (
        (senior?.pendingConnections || []).some(conn => {
          const connId = typeof conn === 'string' ? conn : conn._id || conn;
          return String(connId) === String(user?._id);
        }) ||
        (user?.pendingConnections || []).some(conn => {
          const connId = typeof conn === 'string' ? conn : conn._id || conn;
          const seniorId = typeof senior._id === 'string' ? senior._id : String(senior._id);
          return String(connId) === seniorId;
        })
      );
      
      if (isConnected) {
        setLocalConnectionState('connected');
      } else if (hasPendingRequest) {
        setLocalConnectionState('pending');
      } else {
        setLocalConnectionState('none');
      }
    }
  }, [user, senior, localOverride]);

  const handleConnect = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    try {
      const response = await userService.sendConnectionRequest(senior._id);
      // show pending immediately for good UX
      setLocalConnectionState('pending');
      // re-sync with backend user
      await refetchUser();
      if (onConnectionUpdate) onConnectionUpdate();
      // clear local override if connection shows up on refetch
      setLocalOverride(null);
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg === 'Connection request already sent') {
        // If server says request already exists (on senior), show pending for junior UX
        setLocalOverride('pending'); // persist until refetch confirms
        await refetchUser();
      } else if (msg === 'Connection already exists') {
        setLocalConnectionState('connected');
        await refetchUser();
        setLocalOverride(null);
      } else {
        setLocalConnectionState('none');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWithdraw = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await userService.withdrawConnectionRequest(senior._id);
      // reflect the change locally
      setLocalConnectionState('none');
      // re-sync with backend
      if (onConnectionUpdate) onConnectionUpdate();
      await refetchUser();
    } catch (error) {
      console.warn('withdraw error:', error);
      // if withdraw fails (404/400), still try to re-sync and clear the UI to avoid stuck state
      await refetchUser();
      setLocalConnectionState('none');
      console.error('Error withdrawing connection request:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const isOwnProfile = user?._id === String(senior._id);

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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={senior.profile?.profilePictureUrl || senior.profile?.profilePicture || '/default-avatar.png'}
          alt={senior.username}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
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
              {senior.profile?.bio || senior.seniorProfile?.bio || 'No bio available'}
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

          <div className="mt-4 flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              <FaMapMarkerAlt className="inline mr-1" />
              {String(user?._id) === String(senior?._id || senior._id)
                ? (senior.profile?.location || 'Location not specified')
                : (senior.profile?.location ? maskString(senior.profile.location, { showFirst: 2 }) : 'Location not specified')}
            </div>

            <div className="flex flex-wrap space-x-2 gap-2">
              {/* Show Connect button when not connected and no pending request */}
              {!isOwnProfile && localConnectionState === 'none' && (
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
              )}

              {/* Show Request Pending when request is sent; allow withdraw */}
              {!isOwnProfile && localConnectionState === 'pending' && (
                <div className="flex items-center space-x-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium">
                    Requested
                  </span>
                  <button
                    onClick={handleWithdraw}
                    disabled={isConnecting}
                    className="text-sm px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Show Message button when already connected */}
              {!isOwnProfile && localConnectionState === 'connected' && (
                <div className="flex flex-col items-end space-y-1">
                  <Link
                    to="/chat"
                    state={{ recipient: senior }}
                    className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center"
                  >
                    <FaUserPlus className="mr-1" />
                    Message
                  </Link>
                  <span className="text-green-600 text-xs">Connected</span>
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