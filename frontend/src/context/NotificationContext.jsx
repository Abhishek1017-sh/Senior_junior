import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pendingConnectionsCount, setPendingConnectionsCount] = useState(0);
  const [pendingSessionsCount, setPendingSessionsCount] = useState(0);

  const fetchNotificationCounts = async () => {
    if (!isAuthenticated) return;

    try {
      const [connectionsRes, sessionsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/connections/pending/count'),
        axios.get('http://localhost:5000/api/sessions?status=pending')
      ]);

      setPendingConnectionsCount(connectionsRes.data.count);
      setPendingSessionsCount(sessionsRes.data.data.length);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCounts();
    }
  }, [isAuthenticated]);

  const value = {
    pendingConnectionsCount,
    pendingSessionsCount,
    totalNotificationsCount: pendingConnectionsCount + pendingSessionsCount,
    refreshNotifications: fetchNotificationCounts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};