import { io } from 'socket.io-client';

let socket = null;
let activeToken = null;

export const getSocket = (accessToken) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      auth: {
        token: accessToken
      }
    });
  }

  if (accessToken && activeToken !== accessToken) {
    const wasConnected = socket.connected;
    if (wasConnected) socket.disconnect();
    socket.auth = { token: accessToken };
    activeToken = accessToken;
    if (wasConnected) socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
  activeToken = null;
};
