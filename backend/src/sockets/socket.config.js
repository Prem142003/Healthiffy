import { Server } from 'socket.io';
import { env } from '../config/env.config.js';
import { ROLES } from '../constants/role.constants.js';
import { User } from '../models/User.model.js';
import { verifyAccessToken } from '../services/token.service.js';
import { setSocketServer } from './socket.server.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select('role assignedBranch isActive');
      if (!user?.isActive) return next(new Error('Authentication failed'));
      socket.data.user = user;
      return next();
    } catch (_error) {
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`user:${user._id}`);

    if (user.role === ROLES.ADMIN) {
      socket.join('admin');
    }
    if (user.role === ROLES.WORKER && user.assignedBranch) {
      socket.join(`worker:${user.assignedBranch}`);
    }
  });

  setSocketServer(io);
  return io;
};
