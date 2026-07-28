import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (accessToken) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      auth: { token: accessToken }
    });
  }

  if (accessToken && socket.auth?.token !== accessToken) {
    if (socket.connected) socket.disconnect();
    socket.auth = { token: accessToken };
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};
