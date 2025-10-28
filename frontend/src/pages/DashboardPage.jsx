import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaComments, FaUsers, FaStar, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import sessionService from '../services/sessionService';
import { formatDateTime } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await sessionService.getUserSessions();
        const userSessions = response.data; // The array of sessions
        setSessions(userSessions);

        const now = new Date();
        const upcoming = userSessions.filter(session =>
          new Date(session.scheduledTime) > now && session.status === 'confirmed'
        );
        const completed = userSessions.filter(session =>
          session.status === 'completed'
        );

        setStats({
          totalSessions: userSessions.length,
          upcomingSessions: upcoming.length,
          completedSessions: completed.length,
          averageRating: user?.seniorProfile?.averageRating || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const upcomingSessions = sessions
    .filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      return sessionDate > new Date() && session.status === 'confirmed';
    })
    .slice(0, 3); // Show only next 3 upcoming sessions

  const recentMessages = [
    // Mock data - in real app, fetch from chat service
    { id: 1, from: 'John Doe', message: 'Thanks for the great session!', time: '2 hours ago' },
    { id: 2, from: 'Jane Smith', message: 'Looking forward to our meeting', time: '1 day ago' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.profile?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your mentorship activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaCalendarAlt className="text-blue-600 text-2xl mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              <p className="text-gray-600">Total Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaClock className="text-green-600 text-2xl mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
              <p className="text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaUsers className="text-purple-600 text-2xl mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              <p className="text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaStar className="text-yellow-600 text-2xl mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              <p className="text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link
              to="/my-sessions"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View all
            </Link>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Session with {session.senior?.profile?.firstName} {session.senior?.profile?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{session.topic}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateTime(session.scheduledDate)}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No upcoming sessions</p>
              <Link
                to="/find-seniors"
                className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Find a mentor
              </Link>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Messages</h2>
            <Link
              to="/chat"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View all
            </Link>
          </div>

          {recentMessages.length > 0 ? (
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{message.from}</h3>
                      <p className="text-sm text-gray-600">{message.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaComments className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No recent messages</p>
              <Link
                to="/chat"
                className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Start a conversation
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/find-seniors"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaUsers className="text-2xl mb-2" />
            <h3 className="font-semibold">Find Mentors</h3>
            <p className="text-sm opacity-90">Discover experienced professionals</p>
          </Link>

          <Link
            to="/my-sessions"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaCalendarAlt className="text-2xl mb-2" />
            <h3 className="font-semibold">Manage Sessions</h3>
            <p className="text-sm opacity-90">View and manage your bookings</p>
          </Link>

          <Link
            to="/chat"
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaComments className="text-2xl mb-2" />
            <h3 className="font-semibold">Start Chat</h3>
            <p className="text-sm opacity-90">Connect with mentors and peers</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
