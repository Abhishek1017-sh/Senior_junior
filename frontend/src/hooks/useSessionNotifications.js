  import { useEffect, useState, useRef } from 'react';
  import { useAuth } from '../context/AuthContext';

  const useSessionNotifications = (socket) => {
    const { user } = useAuth();
    const [sessionRequests, setSessionRequests] = useState([]);
    const [sessionMessages, setSessionMessages] = useState({});
    const notificationSoundRef = useRef(null);

    useEffect(() => {
      if (!socket) return;

      // FIX: Listen for new session requests (for seniors)
      socket.on('newSessionRequest', (data) => {
        console.log('New session request received:', data);
        
        // Add to pending requests
        setSessionRequests(prev => [...prev, data]);

        // Play notification sound
        playNotificationSound();

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Session Request', {
            body: data.message,
            icon: data.junior?.profile?.profilePictureUrl || data.junior?.profilePicture || '/default-avatar.png',
          });
        }
      });

      // FIX: Listen for session acceptance
      socket.on('sessionAccepted', (data) => {
        console.log('Session accepted:', data);
        
        // Remove from pending requests
        setSessionRequests(prev => prev.filter(req => req.sessionId !== data.sessionId));

        // Show success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Session Accepted!', {
            body: data.message,
            icon: data.senior?.profile?.profilePictureUrl || data.senior?.profilePicture || '/default-avatar.png',
          });
        }
      });

      // FIX: Listen for session decline
      socket.on('sessionDeclined', (data) => {
        console.log('Session declined:', data);
        
        // Remove from pending requests
        setSessionRequests(prev => prev.filter(req => req.sessionId !== data.sessionId));

        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Session Declined', {
            body: data.message,
          });
        }
      });

      // FIX: Listen for messages about sessions
      socket.on('sessionMessage', (data) => {
        console.log('Session message received:', data);
        
        setSessionMessages(prev => ({
          ...prev,
          [data.sessionId]: [...(prev[data.sessionId] || []), data],
        }));

        // Play notification sound
        playNotificationSound();

        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Message from ${data.from.firstName}`, {
            body: data.message,
          });
        }
      });

      // FIX: Listen for pending sessions list
      socket.on('pendingSessionsList', (data) => {
        console.log('Pending sessions:', data);
        setSessionRequests(data.sessions || []);
      });

      return () => {
        socket.off('newSessionRequest');
        socket.off('sessionAccepted');
        socket.off('sessionDeclined');
        socket.off('sessionMessage');
        socket.off('pendingSessionsList');
      };
    }, [socket]);

    const playNotificationSound = () => {
      // Play a simple beep notification
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    const acceptSession = (sessionId) => {
      if (socket) {
        socket.emit('acceptSession', { sessionId });
      }
    };

    const declineSession = (sessionId, reason = '') => {
      if (socket) {
        socket.emit('declineSession', { sessionId, reason });
      }
    };

    const sendSessionMessage = (sessionId, message) => {
      if (socket) {
        socket.emit('sendSessionMessage', { sessionId, message });
      }
    };

    const getPendingSessions = () => {
      if (socket) {
        socket.emit('getPendingSessions');
      }
    };

    return {
      sessionRequests,
      sessionMessages,
      acceptSession,
      declineSession,
      sendSessionMessage,
      getPendingSessions,
    };
  };

  export default useSessionNotifications;
