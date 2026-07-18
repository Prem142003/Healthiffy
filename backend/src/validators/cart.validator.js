import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

const assertObjectId = (value, field) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`${field} is invalid`, 400);
  }
  return value;
};

const normalizeQuantity = (value, { required = true } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw new AppError('Quantity is required', 400);
    return undefined;
  }

  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    throw new AppError('Quantity must be between 1 and 50', 400);
  }
  return quantity;
};

export const validateAddCartItem = (body) => ({
  menuItem: assertObjectId(body.menuItem, 'Menu item'),
  quantity: normalizeQuantity(body.quantity)
});

export const validateUpdateCartItem = (body) => ({
  quantity: normalizeQuantity(body.quantity)
});

export const validateCheckout = (body) => ({
  specialInstructions:
    typeof body.specialInstructions === 'string'
      ? body.specialInstructions.trim().slice(0, 500)
      : undefined
});
