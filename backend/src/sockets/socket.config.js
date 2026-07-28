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
    try {
      const authorization = socket.handshake.headers.authorization;
      const bearerToken = authorization?.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : null;
      const token = socket.handshake.auth?.token || bearerToken;
      if (!token) return next(new Error('Authentication token is required'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).populate(
        'assignedBranch',
        'name slug status isActive'
      );
      if (!user?.isActive) return next(new Error('User is inactive'));

      socket.user = user;
      return next();
    } catch (_error) {
      return next(new Error('Invalid or expired authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);

    if (socket.user.role === ROLES.ADMIN) {
      socket.join('admin');
    }

    if (socket.user.role === ROLES.WORKER) {
      const branchId = socket.user.assignedBranch?._id || socket.user.assignedBranch;
      if (branchId) socket.join(`worker:${branchId}`);
    }
  });

  setSocketServer(io);
  return io;
};
