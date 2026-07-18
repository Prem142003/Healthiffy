import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItemById,
  getMenuItems,
  updateMenuItem,
  updateMenuItemAvailability
} from '../services/menuItem.service.js';
import {
  validateAvailability,
  validateCreateMenuItem,
  validateUpdateMenuItem
} from '../validators/menuItem.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listPublicMenuItems = catchAsync(async (req, res) => {
  const data = await getMenuItems(req.query);
  sendSuccess(res, 200, 'Menu items fetched', data);
});

export const listAdminMenuItems = catchAsync(async (req, res) => {
  const data = await getMenuItems(req.query, { includeInactive: true });
  sendSuccess(res, 200, 'Menu items fetched', data);
});

export const getPublicMenuItem = catchAsync(async (req, res) => {
  const menuItem = await getMenuItemById(req.params.id);
  sendSuccess(res, 200, 'Menu item fetched', { menuItem });
});

export const getAdminMenuItem = catchAsync(async (req, res) => {
  const menuItem = await getMenuItemById(req.params.id, { includeInactive: true });
  sendSuccess(res, 200, 'Menu item fetched', { menuItem });
});

export const createMenuItemHandler = catchAsync(async (req, res) => {
  const payload = validateCreateMenuItem(req.body);
  const menuItem = await createMenuItem(payload, req.user._id);
  sendSuccess(res, 201, 'Menu item created', { menuItem });
});

export const updateMenuItemHandler = catchAsync(async (req, res) => {
  const payload = validateUpdateMenuItem(req.body);
  const menuItem = await updateMenuItem(req.params.id, payload, req.user._id);
  sendSuccess(res, 200, 'Menu item updated', { menuItem });
});

export const updateMenuItemAvailabilityHandler = catchAsync(async (req, res) => {
  const payload = validateAvailability(req.body);
  const menuItem = await updateMenuItemAvailability(req.params.id, payload.isAvailable, req.user._id);
  sendSuccess(res, 200, 'Menu item availability updated', { menuItem });
});

export const deleteMenuItemHandler = catchAsync(async (req, res) => {
  const menuItem = await deleteMenuItem(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Menu item deleted', { menuItem });
});
