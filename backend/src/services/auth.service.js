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

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const buildButtonEmail = ({ title, intro, actionText, actionUrl, outro }) => ({
  text: `${intro}\n\n${actionText}: ${actionUrl}\n\n${outro}`,
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px;color:#0f5132">${escapeHtml(title)}</h2>
      <p>${escapeHtml(intro)}</p>
      <p style="margin:24px 0">
        <a href="${escapeHtml(actionUrl)}" style="background:#198754;color:#ffffff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block">${escapeHtml(actionText)}</a>
      </p>
      <p style="word-break:break-all;font-size:13px;color:#52616b">If the button does not work, open this link: ${escapeHtml(actionUrl)}</p>
      <p>${escapeHtml(outro)}</p>
      <p style="font-size:12px;color:#6c757d">Healthiffy</p>
    </div>
  `
});

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
  const emailContent = buildButtonEmail({
    title: 'Verify your Healthiffy account',
    intro: `Hi ${user.name || 'there'}, welcome to Healthiffy. Please verify your email address to finish setting up your account.`,
    actionText: 'Verify email',
    actionUrl: verificationUrl,
    outro: 'This verification link expires in 30 minutes.'
  });

  console.log('[auth] Sending verification email', {
    userId: user._id,
    email: user.email,
    verificationUrl: verificationUrl.replace(rawToken, '[token]')
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your Healthiffy account',
      text: emailContent.text,
      html: emailContent.html
    });
    console.log('[auth] Verification email flow completed', { userId: user._id, email: user.email });
  } catch (error) {
    console.error('[auth] Verification email failed', {
      userId: user._id,
      email: user.email,
      message: error.message,
      code: error.code,
      responseCode: error.responseCode
    });
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
  const emailContent = buildButtonEmail({
    title: 'Reset your Healthiffy password',
    intro: `Hi ${user.name || 'there'}, we received a request to reset your Healthiffy password.`,
    actionText: 'Reset password',
    actionUrl: resetUrl,
    outro: 'This reset link expires in 15 minutes. If you did not request this, you can ignore this email.'
  });

  console.log('[auth] Sending password reset email', {
    userId: user._id,
    email: user.email,
    resetUrl: resetUrl.replace(rawToken, '[token]')
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Healthiffy password',
      text: emailContent.text,
      html: emailContent.html
    });
    console.log('[auth] Password reset email flow completed', { userId: user._id, email: user.email });
  } catch (error) {
    console.error('[auth] Password reset email failed', {
      userId: user._id,
      email: user.email,
      message: error.message,
      code: error.code,
      responseCode: error.responseCode
    });
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
