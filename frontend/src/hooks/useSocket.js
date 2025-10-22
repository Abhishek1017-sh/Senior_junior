import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

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
        setIsConnected(true);
        console.log('Connected to chat server');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      });

      // Message events
      socket.on('receiveMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('messageHistory', (history) => {
        setMessages(history);
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
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join', { recipientId });
      setMessages([]); // Clear messages when joining new chat
    }
  };

  const sendMessage = (recipientId, content) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('sendMessage', {
        recipientId,
        content,
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

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    onlineUsers,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
  };
};

export default useSocket;
