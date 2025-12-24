import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaComments, FaUsers, FaStar, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
// Dashboard uses full-bleed hero + constrained content width for cards
import sessionService from '../services/sessionService';
import chatService from '../services/chatService';
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
  const [recentMessages, setRecentMessages] = useState([]);

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
    // Fetch recent messages separately so dashboard loads independent data
    const fetchRecentMessages = async () => {
      try {
        const convos = await chatService.getConversations();
        const msgs = (convos || []).slice(0, 3).map((c) => ({
          id: c._id,
          from: c.participant?.profile?.firstName || c.participant?.username || 'Unknown',
          message: c.lastMessage?.content || '',
          time: new Date(c.lastMessage?.createdAt).toLocaleString(),
        }));
        setRecentMessages(msgs);
      } catch (err) {
        console.error('Failed to fetch recent messages', err);
      }
    };

    fetchDashboardData();
    fetchRecentMessages();
  }, [user]);

  const upcomingSessions = sessions
      .filter(session => {
      const sessionDate = new Date(session.scheduledTime);
      return sessionDate > new Date() && session.status === 'confirmed';
    })
    .slice(0, 3); // Show only next 3 upcoming sessions

  // recentMessages state is fetched from chatService

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Full-bleed hero */}
      <section className="dashboard-hero relative overflow-hidden w-full" aria-labelledby="dashboard-hero-heading" role="region">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-800/70 via-transparent to-accent-600/30" />
        <div className="relative w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-white">
          <h1 id="dashboard-hero-heading" className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow">
            Welcome back, {user?.profile?.firstName}!
          </h1>
          <p className="text-sm md:text-lg text-blue-100/90 max-w-2xl">
            Here's a quick snapshot of your mentorship activities — sessions, messages, and quick actions to keep you moving forward.
          </p>
        </div>
      </section>

      {/* Constrained content */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: FaCalendarAlt, label: 'Total Sessions', value: stats.totalSessions },
            { icon: FaClock, label: 'Upcoming', value: stats.upcomingSessions },
            { icon: FaUsers, label: 'Completed', value: stats.completedSessions },
            { icon: FaStar, label: 'Avg Rating', value: stats.averageRating.toFixed(1) },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="card-surface backdrop-blur-sm border-transparent p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition min-w-0">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-white/20 mr-4">
                    <Icon className="text-blue-700 text-2xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-gray-600">{card.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="card-surface rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div role="region" aria-labelledby="upcoming-sessions-heading">
          <div className="flex justify-between items-center mb-4">
            <h2 id="upcoming-sessions-heading" className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link
              to="/my-sessions"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View all
            </Link>
          </div> 

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                // Resolve participant display — senior vs junior
                const senior = session.seniorId || session.senior;
                const junior = session.juniorId || session.junior;
                const currentUserId = user?._id;
                const isViewingAsSenior = String(currentUserId) === String(senior?._id || senior);
                const participant = isViewingAsSenior ? junior : senior;

                return (
                  <div key={session._id} className="border rounded-lg p-4 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 break-words">
                          Session with {participant?.profile?.firstName} {participant?.profile?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{session.topic}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDateTime(session.scheduledTime)}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Confirmed
                      </span>
                    </div>
                  </div>
                );
              })}
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
        </div>

        {/* Recent Messages */}
        <div className="card-surface rounded-lg shadow-md p-6 hover:shadow-lg transition">
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
                <div key={message.id} className="border rounded-lg p-4 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 break-words">{message.from}</h3>
                      <p className="text-sm text-gray-600 break-words">{message.message}</p>
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
        <div className="card-surface rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/find-seniors" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-lg hover:scale-[1.02] transform transition">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Find Mentors</h3>
                  <p className="text-sm opacity-90">Discover experienced professionals</p>
                </div>
              </div>
            </Link>

            <Link to="/my-sessions" className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-lg hover:scale-[1.02] transform transition">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Sessions</h3>
                  <p className="text-sm opacity-90">View and manage your bookings</p>
                </div>
              </div>
            </Link>

            <Link to="/chat" aria-label="Start Chat" className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-lg hover:scale-[1.02] transform transition focus:outline-none focus:ring-2 focus:ring-primary-400">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaComments className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Start Chat</h3>
                  <p className="text-sm opacity-90">Connect with mentors and peers</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
