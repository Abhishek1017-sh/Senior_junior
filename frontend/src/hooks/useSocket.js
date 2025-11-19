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
  const pendingJoinsRef = useRef(new Set());

  useEffect(() => {
    if (isAuthenticated && user) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
      socketRef.current = io(SOCKET_URL, {
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket', 'polling'],
      });
      const socket = socketRef.current;

      socket.on('connect', () => {
        setIsConnected(true);
        // flush pending joins
        const joins = Array.from(pendingJoinsRef.current);
        pendingJoinsRef.current.clear();
        joins.forEach(id => socket.emit('join', { recipientId: id }));
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // New message handler - dedupe and replace local echoes
      socket.on('newMessage', (message) => {
        if (!message || !message._id) return;

        setMessages(prev => {
          // Replace local echo with server message if same text exists
          const localIndex = prev.findIndex(m => m.isLocal && m.message === message.message);
          if (localIndex !== -1) {
            const newArr = [...prev];
            newArr[localIndex] = message; // replace with server message
            return newArr;
          }
          // Avoid duplicates by _id
          if (prev.some(m => String(m._id) === String(message._id))) return prev;
          return [...prev, message];
        });

        // update unread counts (for other users)
        setUnreadCounts(prev => {
          const newCounts = new Map(prev);
          const senderId = message.senderId?._id || message.senderId;
          if (senderId && String(senderId) !== String(user._id)) {
            newCounts.set(senderId, (newCounts.get(senderId) || 0) + 1);
          }
          return newCounts;
        });
      });

      socket.on('messageHistory', (data) => {
        // Support both { messages } and raw arrays
        const msgs = data?.messages || data?.data || data || [];
        setMessages(msgs);
      });

      // Listen for server typing vs stopped typing names
      socket.on('userTyping', (payload) => {
        // optional typing indicator state handling (not included here)
      });

      socket.on('userStoppedTyping', (payload) => {
        // optional stop typing handling
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
    if (!recipientId) return;
    if (socketRef.current && socketRef.current.connected) {
      setMessages([]); // clear previous messages
      setUnreadCounts(prev => {
        const newCounts = new Map(prev);
        newCounts.set(recipientId, 0);
        return newCounts;
      });
      socketRef.current.emit('join', { recipientId });
    } else {
      pendingJoinsRef.current.add(recipientId);
    }
  };

  const sendMessage = (recipientId, content) => {
    if (!content || !recipientId) return;
    // Local echo
    const localMsg = {
      _id: `local_${Date.now()}`,
      message: content,
      senderId: { _id: user._id, username: user.username, profile: user.profile },
      receiverId: recipientId,
      timestamp: new Date().toISOString(),
      isLocal: true,
    };
    setMessages(prev => [...prev, localMsg]);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sendMessage', { recipientId, message: content });
    } else {
      // Optionally queue message for retry
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
