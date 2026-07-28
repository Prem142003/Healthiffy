import { env } from '../config/env.config.js';
import { ROLES } from '../constants/role.constants.js';
import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  validateChangePassword,
  validateDeleteAccount,
  validateGoogleLogin,
  validateLogin
} from '../validators/auth.validator.js';
import {
  changePassword,
  deleteAccount,
  loginUser,
  refreshUserSession
} from '../services/auth.service.js';
import { loginWithGoogle } from '../services/googleAuth.service.js';
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

export const login = catchAsync(async (req, res) => {
  const payload = validateLogin(req.body);
  const { user, accessToken, refreshToken, refreshExpiresAt } = await loginUser(payload, req);
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  sendSuccess(res, 200, 'Login successful', { user, accessToken });
});

export const googleLogin = catchAsync(async (req, res) => {
  const payload = validateGoogleLogin(req.body);
  const { user, accessToken, refreshToken, refreshExpiresAt } = await loginWithGoogle(payload, req);
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  sendSuccess(res, 200, 'Google login successful', { user, accessToken });
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

export const changeUserPassword = catchAsync(async (req, res) => {
  const payload = validateChangePassword(req.body);
  await changePassword({ userId: req.user._id, ...payload });
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Password changed successfully. Please login again.');
});

export const deleteUserAccount = catchAsync(async (req, res) => {
  const payload = validateDeleteAccount(req.body);
  await deleteAccount({ userId: req.user._id, ...payload });
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Account deleted successfully');
});

export const getMe = catchAsync(async (req, res) => {
  sendSuccess(res, 200, 'Current user fetched', { user: req.user });
});

export const authRoles = (_req, res) => {
  sendSuccess(res, 200, 'Authentication roles fetched', { roles: ROLES });
};
