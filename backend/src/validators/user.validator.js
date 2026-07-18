import mongoose from 'mongoose';
import validator from 'validator';
import { ROLES } from '../constants/role.constants.js';
import { AppError } from '../utils/AppError.js';

const requiredString = (value, field, max = 120) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${field} is required`, 400);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) throw new AppError(`${field} must be ${max} characters or fewer`, 400);
  return trimmed;
};

const optionalObjectId = (value, field) => {
  if (!value) return undefined;
  if (!mongoose.Types.ObjectId.isValid(value)) throw new AppError(`${field} is invalid`, 400);
  return value;
};

const normalizeEmail = (email) => {
  const normalized = requiredString(email, 'Email').toLowerCase();
  if (!validator.isEmail(normalized)) throw new AppError('Email is invalid', 400);
  return normalized;
};

export const validateCreateWorker = (body) => ({
  name: requiredString(body.name, 'Name', 80),
  email: normalizeEmail(body.email),
  phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
  password: requiredString(body.password, 'Password', 200),
  assignedBranch: optionalObjectId(body.assignedBranch, 'Assigned branch')
});

export const validateUpdateUser = (body) => {
  const payload = {};
  if ('name' in body) payload.name = requiredString(body.name, 'Name', 80);
  if ('phone' in body) payload.phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if ('isActive' in body && typeof body.isActive === 'boolean') payload.isActive = body.isActive;
  if ('assignedBranch' in body) payload.assignedBranch = optionalObjectId(body.assignedBranch, 'Assigned branch');
  return payload;
};

export const validateRoleQuery = (role) => {
  if (!role) return undefined;
  const normalized = role.toString().trim().toUpperCase();
  if (!Object.values(ROLES).includes(normalized)) throw new AppError('Role is invalid', 400);
  return normalized;
};
