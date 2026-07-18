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

export const validateRegister = (body) => {
  assertRequiredString(body.name, 'Name');
  assertPassword(body.password);

  return {
    name: body.name.trim(),
    email: normalizeEmail(body.email),
    phone: body.phone?.trim(),
    password: body.password
  };
};

export const validateLogin = (body) => ({
  email: normalizeEmail(body.email),
  password: body.password
});

export const validateEmailToken = (body) => {
  assertRequiredString(body.token, 'Token');
  return {
    email: normalizeEmail(body.email),
    token: body.token
  };
};

export const validateForgotPassword = (body) => ({
  email: normalizeEmail(body.email)
});

export const validateResetPassword = (body) => {
  assertPassword(body.password);
  assertRequiredString(body.token, 'Token');
  return {
    email: normalizeEmail(body.email),
    token: body.token,
    password: body.password
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
