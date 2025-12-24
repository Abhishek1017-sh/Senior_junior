import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FindSeniorsPage from './pages/FindSeniorsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MySessionsPage from './pages/MySessionsPage';
import ChatPage from './pages/ChatPage';
import ConnectionsPage from './pages/ConnectionsPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Add top padding equal to navbar height to avoid overlap */}
      <main role="main" aria-label="Application content" className="w-full max-w-screen-2xl mx-auto px-4 py-8 pt-20 md:pt-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-seniors"
            element={
              <ProtectedRoute>
                <FindSeniorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <ConnectionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-sessions"
            element={
              <ProtectedRoute>
                <MySessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <AppRoutes />
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
