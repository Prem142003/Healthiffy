import validator from 'validator';
import { AppError } from '../utils/AppError.js';

const assertRequiredString = (value, field) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${field} is required`, 400);
  }
};

const assertPassword = (password, field = 'Password') => {
  assertRequiredString(password, field);
  if (password.length < 8) {
    throw new AppError(`${field} must be at least 8 characters`, 400);
  }
};

const normalizeEmail = (email) => {
  assertRequiredString(email, 'Email');
  const normalized = email.trim().toLowerCase();
  if (!validator.isEmail(normalized)) {
    throw new AppError('Email is invalid', 400);
  }
  return normalized;
};

export const validateLogin = (body) => ({
  email: normalizeEmail(body.email),
  password: body.password
});

export const validateGoogleLogin = (body) => {
  assertRequiredString(body.credential, 'Google credential');
  return {
    credential: body.credential.trim()
  };
};

export const validateChangePassword = (body) => {
  assertPassword(body.currentPassword, 'Current password');
  assertPassword(body.newPassword, 'New password');
  return {
    currentPassword: body.currentPassword,
    newPassword: body.newPassword
  };
};

export const validateDeleteAccount = (body) => ({
  currentPassword: typeof body.currentPassword === 'string' ? body.currentPassword : ''
});
