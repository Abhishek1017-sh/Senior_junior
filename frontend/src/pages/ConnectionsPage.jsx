import { useState, useEffect } from 'react';
import { FaUserCheck, FaUserTimes, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import userService from '../services/userService';

const ConnectionsPage = () => {
  const { user, updateUser } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connectionsRes, pendingRes] = await Promise.all([
        userService.getConnections(),
        userService.getPendingConnections()
      ]);
      setConnections(connectionsRes);
      setPendingRequests(pendingRes);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (juniorId) => {
    setActionLoading(juniorId);
    try {
      await userService.acceptConnectionRequest(juniorId);
      // Update local user connections
      updateUser({
        connections: [...(user.connections || []), juniorId],
        pendingConnections: (user.pendingConnections || []).filter(id => id !== juniorId)
      });
      await fetchData();
      refreshNotifications();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept connection request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (juniorId) => {
    setActionLoading(juniorId);
    try {
      await userService.rejectConnectionRequest(juniorId);
      // Update local user pending connections
      updateUser({
        pendingConnections: (user.pendingConnections || []).filter(id => id !== juniorId)
      });
      await fetchData();
      refreshNotifications();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject connection request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    setActionLoading(connectionId);
    try {
      await userService.removeConnection(connectionId);
      await fetchData();
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection');
    } finally {
      setActionLoading(null);
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Connections</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaUserPlus className="mr-2 text-blue-600" />
            Pending Requests ({pendingRequests.length})
          </h2>

          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={request.profile?.profilePictureUrl || '/default-avatar.png'}
                      alt={request.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.profile?.firstName} {request.profile?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">@{request.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{request.role}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={actionLoading === request._id}
                      className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <FaUserCheck className="mr-1" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={actionLoading === request._id}
                      className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <FaUserTimes className="mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No pending connection requests</p>
          )}
        </div>

        {/* Current Connections */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaUserCheck className="mr-2 text-green-600" />
            My Connections ({connections.length})
          </h2>

          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={connection.profile?.profilePictureUrl || '/default-avatar.png'}
                      alt={connection.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {connection.profile?.firstName} {connection.profile?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">@{connection.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{connection.role}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `/chat?recipient=${connection._id}`}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleRemoveConnection(connection._id)}
                      disabled={actionLoading === connection._id}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No connections yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;