import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNotifications } from '../context/NotificationContext';
import { FaUser, FaSignOutAlt, FaHome, FaUsers, FaCalendarAlt, FaComments, FaUserFriends } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalUnreadCount } = useChat();
  const { pendingConnectionsCount, pendingSessionsCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm shadow-soft h-16 md:h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
            Senior-Junior Connect
          </Link>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                  <FaHome />
                  <span>Dashboard</span>
                </Link>

                <Link to="/find-seniors" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                  <FaUsers />
                  <span>Find Seniors</span>
                </Link>

                <Link to="/connections" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 relative">
                  <FaUserFriends />
                  <span>Connections</span>
                  {pendingConnectionsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingConnectionsCount > 99 ? '99+' : pendingConnectionsCount}
                    </span>
                  )}
                </Link>

                <Link to="/my-sessions" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 relative">
                  <FaCalendarAlt />
                  <span>My Sessions</span>
                  {pendingSessionsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingSessionsCount > 99 ? '99+' : pendingSessionsCount}
                    </span>
                  )}
                </Link>

                <Link to="/chat" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 relative">
                  <FaComments />
                  <span>Chat</span>
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <FaUser />
                    <span>{user?.username}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to={`/profile/${user?._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/edit-profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-md text-primary-700 hover:text-primary-800 border border-primary-200 bg-white">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
//EXPORT
export default Navbar;