import { env } from '../config/env.config.js';
import { ROLES } from '../constants/role.constants.js';
import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  validateChangePassword,
  validateEmailToken,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword
} from '../validators/auth.validator.js';
import {
  changePassword,
  loginUser,
  refreshUserSession,
  registerCustomer,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  verifyEmail
} from '../services/auth.service.js';
import { revokeAllRefreshTokensForUser, revokeRefreshToken } from '../services/token.service.js';
import { catchAsync } from '../utils/catchAsync.js';

const cookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  domain: env.cookieDomain,
  expires: expiresAt
});

const setRefreshCookie = (res, refreshToken, expiresAt) => {
  res.cookie(env.refreshCookieName, refreshToken, cookieOptions(expiresAt));
};

const clearRefreshCookie = (res) => {
  res.clearCookie(env.refreshCookieName, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    domain: env.cookieDomain
  });
};

export const register = catchAsync(async (req, res) => {
  const payload = validateRegister(req.body);
  const user = await registerCustomer(payload);
  sendSuccess(res, 201, 'Registration successful. Please verify your email.', { user });
});

export const login = catchAsync(async (req, res) => {
  const payload = validateLogin(req.body);
  const { user, accessToken, refreshToken, refreshExpiresAt } = await loginUser(payload, req);
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  sendSuccess(res, 200, 'Login successful', { user, accessToken });
});

export const refreshToken = catchAsync(async (req, res) => {
  const currentToken = req.cookies[env.refreshCookieName];
  const { user, accessToken, refreshToken: nextRefreshToken, refreshExpiresAt } =
    await refreshUserSession(currentToken, req);

  setRefreshCookie(res, nextRefreshToken, refreshExpiresAt);
  sendSuccess(res, 200, 'Token refreshed', { user, accessToken });
});

export const logout = catchAsync(async (req, res) => {
  const currentToken = req.cookies[env.refreshCookieName];
  if (currentToken) {
    await revokeRefreshToken(currentToken);
  }
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Logout successful');
});

export const logoutAll = catchAsync(async (req, res) => {
  await revokeAllRefreshTokensForUser(req.user._id);
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Logged out from all devices');
});

export const verifyEmailAddress = catchAsync(async (req, res) => {
  const payload = validateEmailToken(req.body);
  const user = await verifyEmail(payload);
  sendSuccess(res, 200, 'Email verified successfully', { user });
});

export const resendVerificationEmail = catchAsync(async (req, res) => {
  const payload = validateForgotPassword(req.body);
  await resendVerification(payload.email);
  sendSuccess(res, 200, 'Verification email sent');
});

export const forgotPassword = catchAsync(async (req, res) => {
  const payload = validateForgotPassword(req.body);
  await requestPasswordReset(payload.email);
  sendSuccess(res, 200, 'If an account exists, a password reset email has been sent');
});

export const resetUserPassword = catchAsync(async (req, res) => {
  const payload = validateResetPassword(req.body);
  await resetPassword(payload);
  sendSuccess(res, 200, 'Password reset successful');
});

export const changeUserPassword = catchAsync(async (req, res) => {
  const payload = validateChangePassword(req.body);
  await changePassword({ userId: req.user._id, ...payload });
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Password changed successfully. Please login again.');
});

export const getMe = catchAsync(async (req, res) => {
  sendSuccess(res, 200, 'Current user fetched', { user: req.user });
});

export const authRoles = (_req, res) => {
  sendSuccess(res, 200, 'Authentication roles fetched', { roles: ROLES });
};
