import mongoose from 'mongoose';
import validator from 'validator';
import { AppError } from '../utils/AppError.js';

const stringValue = (value, field, { required = true, max = 800 } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw new AppError(`${field} is required`, 400);
    return undefined;
  }
  if (typeof value !== 'string') throw new AppError(`${field} must be text`, 400);

  const normalized = value.trim();
  if (!normalized && required) throw new AppError(`${field} is required`, 400);
  if (normalized.length > max) {
    throw new AppError(`${field} must be ${max} characters or fewer`, 400);
  }
  return normalized || undefined;
};

const objectId = (value, field) => {
  const normalized = stringValue(value, field, { max: 100 });
  if (!mongoose.isValidObjectId(normalized)) throw new AppError(`${field} is invalid`, 400);
  return normalized;
};

const positiveNumber = (value, field, { integer = false, max } = {}) => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 1 || (integer && !Number.isInteger(normalized))) {
    throw new AppError(`${field} must be a positive ${integer ? 'integer' : 'number'}`, 400);
  }
  if (max && normalized > max) throw new AppError(`${field} cannot exceed ${max}`, 400);
  return normalized;
};

const branchIds = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError('At least one branch is required', 400);
  }
  return [...new Set(value.map((id) => objectId(id, 'Branch')))];
};

const image = (body) => {
  const imageUrl = stringValue(body.imageUrl, 'Image URL', { required: false, max: 1000 });
  if (imageUrl && !validator.isURL(imageUrl, { require_protocol: true })) {
    throw new AppError('Image URL must be valid', 400);
  }
  if (!imageUrl) return undefined;

  return {
    url: imageUrl,
    publicId: stringValue(body.imagePublicId, 'Image public ID', {
      required: false,
      max: 200
    })
  };
};

const assertMealCountFitsDuration = (payload) => {
  if (payload.totalMeals > payload.durationDays) {
    throw new AppError('Total meals cannot exceed subscription duration', 400);
  }
};

export const validateCreateSubscriptionPlan = (body) => {
  const payload = {
    name: stringValue(body.name, 'Plan name', { max: 120 }),
    menuItem: objectId(body.menuItem, 'Menu item'),
    branches: branchIds(body.branches),
    description: stringValue(body.description, 'Description', { required: false }),
    image: image(body),
    price: positiveNumber(body.price, 'Price'),
    durationDays: positiveNumber(body.durationDays, 'Duration', { integer: true, max: 366 }),
    totalMeals: positiveNumber(body.totalMeals, 'Total meals', { integer: true, max: 366 }),
    isActive: typeof body.isActive === 'boolean' ? body.isActive : true
  };
  assertMealCountFitsDuration(payload);
  return payload;
};

export const validateUpdateSubscriptionPlan = (body) => {
  const payload = {};
  if ('name' in body) payload.name = stringValue(body.name, 'Plan name', { max: 120 });
  if ('menuItem' in body) payload.menuItem = objectId(body.menuItem, 'Menu item');
  if ('branches' in body) payload.branches = branchIds(body.branches);
  if ('description' in body) {
    payload.description = stringValue(body.description, 'Description', { required: false });
  }
  if ('imageUrl' in body) payload.image = image(body);
  if ('price' in body) payload.price = positiveNumber(body.price, 'Price');
  if ('durationDays' in body) {
    payload.durationDays = positiveNumber(body.durationDays, 'Duration', {
      integer: true,
      max: 366
    });
  }
  if ('totalMeals' in body) {
    payload.totalMeals = positiveNumber(body.totalMeals, 'Total meals', {
      integer: true,
      max: 366
    });
  }
  if ('isActive' in body) {
    if (typeof body.isActive !== 'boolean') {
      throw new AppError('isActive must be true or false', 400);
    }
    payload.isActive = body.isActive;
  }
  return payload;
};

export const validateSubscriptionPurchase = (body) => ({
  planId: objectId(body.planId, 'Plan'),
  branchId: objectId(body.branchId, 'Branch'),
  customerPhone: stringValue(body.customerPhone, 'Mobile number', { max: 20 })
});

export const validateDelivery = (body) => ({
  notes: stringValue(body.notes, 'Notes', { required: false, max: 300 })
});

