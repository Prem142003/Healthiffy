import { User } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { verifyAccessToken } from '../services/token.service.js';

export const authenticate = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new AppError('Authentication token is required', 401);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (_error) {
    throw new AppError('Invalid or expired authentication token', 401);
  }

  const user = await User.findById(decoded.sub).populate('assignedBranch', 'name slug status isActive');

  if (!user || !user.isActive) {
    throw new AppError('User no longer exists or is inactive', 401);
  }

  req.user = user;
  next();
});
