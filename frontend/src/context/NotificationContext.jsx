/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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

  // FIX BUG 3: Use useCallback to prevent function recreation
  const fetchNotificationCounts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const [connectionsRes, sessionsRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/connections/pending/count`),
        axios.get(`${apiBaseUrl}/sessions?status=pending`)
      ]);

      setPendingConnectionsCount(connectionsRes.data.count);
      setPendingSessionsCount(sessionsRes.data.data.length);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCounts();
    }
  }, [isAuthenticated, fetchNotificationCounts]);

  // FIX BUG 3: Use useMemo to prevent context value recreation
  const value = useMemo(() => ({
    pendingConnectionsCount,
    pendingSessionsCount,
    totalNotificationsCount: pendingConnectionsCount + pendingSessionsCount,
    refreshNotifications: fetchNotificationCounts,
  }), [pendingConnectionsCount, pendingSessionsCount, fetchNotificationCounts]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};