import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const useSocket = (initialUnreadCounts = new Map()) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState(initialUnreadCounts);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected successfully!');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      });

      // Message events
      socket.on('newMessage', (message) => {
        if (message && message._id) {
          // If this message is not from the current conversation, increment unread count
          setUnreadCounts(prev => {
            const newCounts = new Map(prev);
            const senderId = message.senderId._id;
            // Only increment if message is not from current user and not in current conversation
            if (senderId !== user._id) {
              newCounts.set(senderId, (newCounts.get(senderId) || 0) + 1);
            }
            return newCounts;
          });
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('messageHistory', (data) => {
        console.log('Received messageHistory:', data);
        setMessages(data.messages || []);
      });

      // User presence events
      socket.on('usersOnline', (users) => {
        setOnlineUsers(users);
      });

      socket.on('userJoined', (user) => {
        setOnlineUsers(prev => [...prev, user]);
      });

      socket.on('userLeft', (userId) => {
        setOnlineUsers(prev => prev.filter(user => user._id !== userId));
      });

      // Typing indicators
      socket.on('userTyping', (data) => {
        // Handle typing indicators
      });

      socket.on('userStopTyping', (data) => {
        // Handle stop typing indicators
      });

      return () => {
        socket.disconnect();
        setIsConnected(false);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinChat = (recipientId) => {
    console.log('joinChat called with recipientId:', recipientId, 'isConnected:', isConnected);
    if (socketRef.current && isConnected) {
      // Clear messages immediately when joining a new chat
      setMessages([]);
      // Mark messages as read for this conversation
      setUnreadCounts(prev => {
        const newCounts = new Map(prev);
        newCounts.set(recipientId, 0);
        return newCounts;
      });
      socketRef.current.emit('join', { recipientId });
      console.log('Emitted join event for recipientId:', recipientId);
    } else {
      console.error('Cannot join chat: socket not connected or not available');
    }
  };

  const sendMessage = (recipientId, content) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('sendMessage', {
        recipientId,
        message: content,
      });
    }
  };

  const startTyping = (recipientId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { recipientId });
    }
  };

  const stopTyping = (recipientId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('stopTyping', { recipientId });
    }
  };

  const markMessagesAsRead = useCallback((senderId) => {
    setUnreadCounts(prev => {
      const newCounts = new Map(prev);
      newCounts.set(senderId, 0);
      return newCounts;
    });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    onlineUsers,
    unreadCounts,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
  };
};

export default useSocket;
