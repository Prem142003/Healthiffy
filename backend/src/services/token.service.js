import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { hashToken } from '../helpers/token.helper.js';

const parseExpiryToMs = (value) => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return amount * multipliers[unit];
};

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

export const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: Date.now()
    },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const persistRefreshToken = async ({ user, refreshToken, req }) => {
  const expiresAt = new Date(Date.now() + parseExpiryToMs(env.jwtRefreshExpiresIn));

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    deviceInfo: req.get('user-agent'),
    ipAddress: req.ip,
    expiresAt
  });

  return expiresAt;
};

export const revokeRefreshToken = (refreshToken) =>
  RefreshToken.findOneAndUpdate(
    { tokenHash: hashToken(refreshToken), revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

export const revokeAllRefreshTokensForUser = (userId) =>
  RefreshToken.updateMany(
    { user: userId, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );
