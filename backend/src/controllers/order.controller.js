import { ROLES } from '../constants/role.constants.js';
import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getOrders
} from '../services/order.service.js';
import {
  validateCreateOrder
} from '../validators/order.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createOrderHandler = catchAsync(async (req, res) => {
  const payload = validateCreateOrder(req.body);
  const order = await createOrder(payload, req.user._id);
  sendSuccess(res, 201, 'Order placed', { order });
});

export const listMyOrders = catchAsync(async (req, res) => {
  const data = await getCustomerOrders(req.user._id, req.query);
  sendSuccess(res, 200, 'Orders fetched', data);
});

export const listAdminOrders = catchAsync(async (req, res) => {
  const data = await getOrders(req.query);
  sendSuccess(res, 200, 'Orders fetched', data);
});

export const getOrderHandler = catchAsync(async (req, res) => {
  const order = await getOrderById(req.params.id, {
    requesterId: req.user._id,
    isAdmin: req.user.role === ROLES.ADMIN
  });
  sendSuccess(res, 200, 'Order fetched', { order });
});
