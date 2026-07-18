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

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.sub);

  if (!user || !user.isActive) {
    throw new AppError('User no longer exists or is inactive', 401);
  }

  req.user = user;
  next();
});
