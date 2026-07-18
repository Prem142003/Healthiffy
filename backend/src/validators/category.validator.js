import validator from 'validator';
import { AppError } from '../utils/AppError.js';

const assertString = (value, field, { required = true, max = 300 } = {}) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    if (required) throw new AppError(`${field} is required`, 400);
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new AppError(`${field} must be ${max} characters or fewer`, 400);
  }

  return trimmed;
};

const optionalUrl = (value, field) => {
  const normalized = assertString(value, field, { required: false, max: 1000 });
  if (normalized && !validator.isURL(normalized, { require_protocol: true })) {
    throw new AppError(`${field} must be a valid URL`, 400);
  }
  return normalized;
};

const normalizeDisplayOrder = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const order = Number(value);
  if (!Number.isInteger(order) || order < 0) {
    throw new AppError('Display order must be a non-negative whole number', 400);
  }
  return order;
};

export const validateCreateCategory = (body) => ({
  name: assertString(body.name, 'Category name', { max: 80 }),
  description: assertString(body.description, 'Description', { required: false }),
  image: body.imageUrl
    ? {
        url: optionalUrl(body.imageUrl, 'Category image URL'),
        publicId: assertString(body.imagePublicId, 'Image public ID', { required: false, max: 200 })
      }
    : undefined,
  displayOrder: normalizeDisplayOrder(body.displayOrder),
  isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined
});

export const validateUpdateCategory = (body) => {
  const payload = {};

  if ('name' in body) payload.name = assertString(body.name, 'Category name', { max: 80 });
  if ('description' in body) payload.description = assertString(body.description, 'Description', { required: false });
  if ('displayOrder' in body) payload.displayOrder = normalizeDisplayOrder(body.displayOrder);
  if ('isActive' in body && typeof body.isActive === 'boolean') payload.isActive = body.isActive;
  if ('imageUrl' in body) {
    payload.image = body.imageUrl
      ? {
          url: optionalUrl(body.imageUrl, 'Category image URL'),
          publicId: assertString(body.imagePublicId, 'Image public ID', { required: false, max: 200 })
        }
      : undefined;
  }

  return payload;
};

export const validateCategoryStatus = (body) => {
  if (typeof body.isActive !== 'boolean') {
    throw new AppError('isActive must be true or false', 400);
  }

  return { isActive: body.isActive };
};
