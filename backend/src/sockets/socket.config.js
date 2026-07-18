import { Server } from 'socket.io';
import { env } from '../config/env.config.js';
import { setSocketServer } from './socket.server.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('join:worker', (branchId) => {
      if (branchId) socket.join(`worker:${branchId}`);
    });

    socket.on('join:user', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });

  setSocketServer(io);
  return io;
};
