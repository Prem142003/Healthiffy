import mongoose from 'mongoose';
import validator from 'validator';
import { FOOD_TYPES } from '../constants/menu.constants.js';
import { AppError } from '../utils/AppError.js';

const assertString = (value, field, { required = true, max = 600 } = {}) => {
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

const assertObjectId = (value, field) => {
  const normalized = assertString(value, field, { max: 100 });
  if (!mongoose.Types.ObjectId.isValid(normalized)) {
    throw new AppError(`${field} is invalid`, 400);
  }
  return normalized;
};

const optionalUrl = (value, field) => {
  const normalized = assertString(value, field, { required: false, max: 1000 });
  if (normalized && !validator.isURL(normalized, { require_protocol: true })) {
    throw new AppError(`${field} must be a valid URL`, 400);
  }
  return normalized;
};

const normalizeNumber = (value, field, { required = true, min = 0 } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw new AppError(`${field} is required`, 400);
    return undefined;
  }

  const number = Number(value);
  if (!Number.isFinite(number) || number < min) {
    throw new AppError(`${field} must be at least ${min}`, 400);
  }
  return number;
};

const normalizeFoodType = (value) => {
  const normalized = assertString(value, 'Food type', { max: 20 }).toUpperCase();
  if (!Object.values(FOOD_TYPES).includes(normalized)) {
    throw new AppError('Food type is invalid', 400);
  }
  return normalized;
};

const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.toString().trim()).filter(Boolean).slice(0, 12);
  }
  return tags
    .toString()
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
};

const assertOfferPrice = (payload) => {
  if (payload.offerPrice !== undefined && payload.offerPrice > payload.price) {
    throw new AppError('Offer price cannot be greater than price', 400);
  }
};

export const validateCreateMenuItem = (body) => {
  const payload = {
    name: assertString(body.name, 'Menu item name', { max: 120 }),
    description: assertString(body.description, 'Description'),
    price: normalizeNumber(body.price, 'Price'),
    offerPrice: normalizeNumber(body.offerPrice, 'Offer price', { required: false }),
    category: assertObjectId(body.category, 'Category'),
    branch: assertObjectId(body.branch, 'Branch'),
    preparationTime: normalizeNumber(body.preparationTime, 'Preparation time', { min: 1 }),
    foodType: normalizeFoodType(body.foodType),
    isBestseller: typeof body.isBestseller === 'boolean' ? body.isBestseller : undefined,
    isAvailable: typeof body.isAvailable === 'boolean' ? body.isAvailable : undefined,
    isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
    tags: normalizeTags(body.tags),
    image: body.imageUrl
      ? {
          url: optionalUrl(body.imageUrl, 'Menu image URL'),
          publicId: assertString(body.imagePublicId, 'Image public ID', { required: false, max: 200 })
        }
      : undefined
  };

  assertOfferPrice(payload);
  return payload;
};

export const validateUpdateMenuItem = (body) => {
  const payload = {};

  if ('name' in body) payload.name = assertString(body.name, 'Menu item name', { max: 120 });
  if ('description' in body) payload.description = assertString(body.description, 'Description');
  if ('price' in body) payload.price = normalizeNumber(body.price, 'Price');
  if ('offerPrice' in body) payload.offerPrice = normalizeNumber(body.offerPrice, 'Offer price', { required: false });
  if ('category' in body) payload.category = assertObjectId(body.category, 'Category');
  if ('branch' in body) payload.branch = assertObjectId(body.branch, 'Branch');
  if ('preparationTime' in body) payload.preparationTime = normalizeNumber(body.preparationTime, 'Preparation time', { min: 1 });
  if ('foodType' in body) payload.foodType = normalizeFoodType(body.foodType);
  if ('isBestseller' in body && typeof body.isBestseller === 'boolean') payload.isBestseller = body.isBestseller;
  if ('isAvailable' in body && typeof body.isAvailable === 'boolean') payload.isAvailable = body.isAvailable;
  if ('isActive' in body && typeof body.isActive === 'boolean') payload.isActive = body.isActive;
  if ('tags' in body) payload.tags = normalizeTags(body.tags);
  if ('imageUrl' in body) {
    payload.image = body.imageUrl
      ? {
          url: optionalUrl(body.imageUrl, 'Menu image URL'),
          publicId: assertString(body.imagePublicId, 'Image public ID', { required: false, max: 200 })
        }
      : undefined;
  }

  return payload;
};

export const validateAvailability = (body) => {
  if (typeof body.isAvailable !== 'boolean') {
    throw new AppError('isAvailable must be true or false', 400);
  }
  return { isAvailable: body.isAvailable };
};
