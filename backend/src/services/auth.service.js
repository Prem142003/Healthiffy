import { ROLES } from '../constants/role.constants.js';
import { Cart } from '../models/Cart.model.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { User } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import {
  persistRefreshToken,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from './token.service.js';
import { hashToken } from '../helpers/token.helper.js';

export const issueAuthTokens = async (user, req) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshExpiresAt = await persistRefreshToken({ user, refreshToken, req });
  return { accessToken, refreshToken, refreshExpiresAt };
};

export const loginUser = async ({ email, password }, req) => {
  const user = await User.findOne({ email }).select('+password').populate('assignedBranch', 'name slug status isActive');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.role === ROLES.CUSTOMER) {
    throw new AppError('Customers must continue with Google', 403);
  }

  if (!user.isActive) {
    throw new AppError('This account is inactive', 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  const tokens = await issueAuthTokens(user, req);
  user.password = undefined;

  return { user, ...tokens };
};

export const refreshUserSession = async (refreshToken, req) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new AppError('Invalid refresh token', 401);
  }

  const storedToken = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    user: decoded.sub,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  }).populate({
    path: 'user',
    populate: { path: 'assignedBranch', select: 'name slug status isActive' }
  });

  if (!storedToken || !storedToken.user?.isActive) {
    throw new AppError('Invalid refresh token', 401);
  }

  await revokeRefreshToken(refreshToken);
  const tokens = await issueAuthTokens(storedToken.user, req);
  return { user: storedToken.user, ...tokens };
};

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user?.password) {
    throw new AppError('Password login is not enabled for this account', 400);
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();
  await revokeAllRefreshTokensForUser(user._id);
};

export const deleteAccount = async ({ userId, currentPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.password && !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  await Promise.all([
    Cart.deleteMany({ user: userId }),
    RefreshToken.deleteMany({ user: userId })
  ]);
  await User.deleteOne({ _id: userId });
};
