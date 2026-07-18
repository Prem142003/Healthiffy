import mongoose from 'mongoose';
import { ORDER_STATUS } from '../constants/order.constants.js';
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

export const validateUpdateOrderStatus = (body) => {
  const status = body.status?.toString().trim().toUpperCase();
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new AppError('Order status is invalid', 400);
  }

  return {
    status,
    note: typeof body.note === 'string' ? body.note.trim().slice(0, 200) : undefined
  };
};

export const validateCancelOrder = (body) => ({
  note: typeof body.note === 'string' ? body.note.trim().slice(0, 200) : undefined
});
