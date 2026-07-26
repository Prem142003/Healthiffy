import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

const assertObjectId = (value, field) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`${field} is invalid`, 400);
  }
  return value;
};

const normalizeQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    throw new AppError('Item quantity must be between 1 and 50', 400);
  }
  return quantity;
};

export const validateCreateOrder = (body) => {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new AppError('Order items are required', 400);
  }

  return {
    branch: assertObjectId(body.branch, 'Branch'),
    items: body.items.map((item) => ({
      menuItem: assertObjectId(item.menuItem, 'Menu item'),
      quantity: normalizeQuantity(item.quantity)
    })),
    specialInstructions:
      typeof body.specialInstructions === 'string'
        ? body.specialInstructions.trim().slice(0, 500)
        : undefined
  };
};
