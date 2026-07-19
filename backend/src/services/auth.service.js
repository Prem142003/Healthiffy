import { env } from '../config/env.config.js';
import { PUBLIC_REGISTRATION_ROLE } from '../constants/role.constants.js';
import { createRandomToken, hashToken } from '../helpers/token.helper.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { User } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import { sendEmail } from './email.service.js';
import {
  persistRefreshToken,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from './token.service.js';

const issueAuthTokens = async (user, req) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshExpiresAt = await persistRefreshToken({ user, refreshToken, req });
  return { accessToken, refreshToken, refreshExpiresAt };
};

const sendVerificationEmail = async (user) => {
  const rawToken = createRandomToken();
  user.emailVerificationToken = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${env.clientUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your Healthiffy account',
      text: `Verify your account using this link: ${verificationUrl}`
    });
  } catch (error) {
    console.error('Verification email failed:', error.message);
  }
};

export const registerCustomer = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: PUBLIC_REGISTRATION_ROLE
  });

  await sendVerificationEmail(user);
  return user;
};

export const loginUser = async ({ email, password }, req) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
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
  }).populate('user');

  if (!storedToken || !storedToken.user?.isActive) {
    throw new AppError('Invalid refresh token', 401);
  }

  await revokeRefreshToken(refreshToken);
  const tokens = await issueAuthTokens(storedToken.user, req);
  return { user: storedToken.user, ...tokens };
};

export const verifyEmail = async ({ email, token }) => {
  const user = await User.findOne({
    email,
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Verification token is invalid or expired', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

export const resendVerification = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  await sendVerificationEmail(user);
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const rawToken = createRandomToken();
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Healthiffy password',
      text: `Reset your password using this link: ${resetUrl}`
    });
  } catch (error) {
    console.error('Password reset email failed:', error.message);
    throw error;
  }
};

export const resetPassword = async ({ email, token, password }) => {
  const user = await User.findOne({
    email,
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Password reset token is invalid or expired', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  await revokeAllRefreshTokensForUser(user._id);
};

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();
  await revokeAllRefreshTokensForUser(user._id);
};
