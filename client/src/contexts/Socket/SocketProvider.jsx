import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SocketContext } from './SocketContext.jsx';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socketUrl =
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // Initialize connection
    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    // Authenticate/Join targeted room
    newSocket.on('connect', () => {
      newSocket.emit('join_user_room', user._id);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
