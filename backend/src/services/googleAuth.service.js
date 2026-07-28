import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.config.js';
import { ROLES } from '../constants/role.constants.js';
import { User } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import { issueAuthTokens } from './auth.service.js';

const googleClient = new OAuth2Client(env.googleClientId);
const allowedIssuers = new Set(['accounts.google.com', 'https://accounts.google.com']);

const verifyGoogleCredential = async (credential) => {
  if (!env.googleClientId) {
    throw new AppError('Google OAuth is not configured', 500);
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId
    });
  } catch (_error) {
    throw new AppError('Google credential is invalid', 401);
  }

  const payload = ticket.getPayload();
  if (!payload || !allowedIssuers.has(payload.iss)) {
    throw new AppError('Google credential issuer is invalid', 401);
  }

  if (!payload.email || !payload.email_verified) {
    throw new AppError('Google account email is not verified', 401);
  }

  if (!payload.sub) {
    throw new AppError('Google account id is missing', 401);
  }

  return payload;
};

export const loginWithGoogle = async ({ credential }, req) => {
  const googleUser = await verifyGoogleCredential(credential);
  const email = googleUser.email.toLowerCase();

  let user = await User.findOne({
    $or: [{ googleId: googleUser.sub }, { email }]
  });

  if (user && user.role !== ROLES.CUSTOMER) {
    throw new AppError('Admin and worker accounts must use staff login', 403);
  }

  if (!user) {
    user = await User.create({
      name: googleUser.name || email.split('@')[0],
      email,
      avatar: googleUser.picture,
      googleId: googleUser.sub,
      role: ROLES.CUSTOMER
    });
  } else {
    user.name = user.name || googleUser.name || email.split('@')[0];
    user.avatar = googleUser.picture || user.avatar;
    user.googleId = user.googleId || googleUser.sub;
    await user.save({ validateBeforeSave: false });
  }

  if (!user.isActive) {
    throw new AppError('This account is inactive', 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = await issueAuthTokens(user, req);
  return { user, ...tokens };
};
