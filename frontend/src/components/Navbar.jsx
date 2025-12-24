import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNotifications } from '../context/NotificationContext';
import { FaUser, FaSignOutAlt, FaHome, FaUsers, FaCalendarAlt, FaComments, FaUserFriends, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalUnreadCount } = useChat();
  const { pendingConnectionsCount, pendingSessionsCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 site-nav backdrop-blur-sm shadow-soft h-16 md:h-20" aria-label="Primary navigation">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
            Senior-Junior Connect
          </Link>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 text-white/90 hover:text-white">
                  <FaHome />
                  <span>Dashboard</span>
                </Link>

                <Link to="/find-seniors" className="flex items-center space-x-1 text-white/90 hover:text-white">
                  <FaUsers />
                  <span>Find Seniors</span>
                </Link>

                <Link to="/connections" className="flex items-center space-x-1 text-white/90 hover:text-white relative">
                  <FaUserFriends />
                  <span>Connections</span>
                  {pendingConnectionsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingConnectionsCount > 99 ? '99+' : pendingConnectionsCount}
                    </span>
                  )}
                </Link>

                <Link to="/my-sessions" className="flex items-center space-x-1 text-white/90 hover:text-white relative">
                  <FaCalendarAlt />
                  <span>My Sessions</span>
                  {pendingSessionsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingSessionsCount > 99 ? '99+' : pendingSessionsCount}
                    </span>
                  )}
                </Link>

                <Link to="/chat" className="flex items-center space-x-1 text-white/90 hover:text-white relative">
                  <FaComments />
                  <span>Chat</span>
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-1 text-white/90 hover:text-white">
                    <FaUser />
                    <span>{user?.username}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-[#0b1220]/95 border border-white/10 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-1 transition-all duration-200 z-50 overflow-hidden">
                    <Link
                      to={`/profile/${user?._id}`}
                      className="block px-4 py-2 text-sm text-white/90 hover:bg-white/6"
                    >
                      View Profile
                    </Link> 
                    <Link
                      to="/edit-profile"
                      className="block px-4 py-2 text-sm text-white/90 hover:bg-white/6"
                    >
                      Edit Profile
                    </Link> 
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-red-600/80 hover:text-white"
                    >
                      <FaSignOutAlt className="inline mr-2 text-white/90" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" aria-label="Login" className="px-4 py-2 rounded-md text-white border border-white/20 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
                  Login
                </Link>
                <Link to="/register" aria-label="Register" className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-white">
                  Register
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button aria-controls="mobile-menu" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400">
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div id="mobile-menu" data-testid="mobile-menu" className={`md:hidden site-nav-mobile ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-3 space-y-2">
          <Link to="/dashboard" className="block px-2 py-2 rounded-md text-white hover:bg-white/5">Dashboard</Link>
          <Link to="/find-seniors" className="block px-2 py-2 rounded-md text-white hover:bg-white/5">Find Seniors</Link>
          <Link to="/connections" className="block px-2 py-2 rounded-md text-white hover:bg-white/5">Connections</Link>
          <Link to="/my-sessions" className="block px-2 py-2 rounded-md text-white hover:bg-white/5">My Sessions</Link>
          <Link to="/chat" className="block px-2 py-2 rounded-md text-white hover:bg-white/5">Chat</Link>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="w-full text-left px-2 py-2 rounded-md text-gray-700 hover:bg-gray-50">Logout</button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-3 py-2 rounded-md text-primary-700 border border-primary-200 bg-white">Login</Link>
              <Link to="/register" className="px-3 py-2 rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-500">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
//EXPORT
export default Navbar;