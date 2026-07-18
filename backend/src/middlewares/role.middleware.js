import { AppError } from '../utils/AppError.js';

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError('You do not have permission to access this resource', 403);
  }

  next();
};
