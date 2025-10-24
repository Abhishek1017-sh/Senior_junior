import { createContext, useContext, useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { unreadCounts, isConnected } = useSocket();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    // Calculate total unread messages
    const total = Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0);
    setTotalUnreadCount(total);
  }, [unreadCounts]);

  const value = {
    totalUnreadCount,
    unreadCounts,
    isConnected,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};