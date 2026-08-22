import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { CUSTOMER_PAYMENT_MODE } from '../constants/payment.constants.js';
import { env } from '../config/env.config.js';
import { generateOrderNumber } from '../helpers/orderNumber.helper.js';
import { Branch } from '../models/Branch.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Order } from '../models/Order.model.js';
import { AppError } from '../utils/AppError.js';
import { createCounterPayment } from './counterPayment.service.js';

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const populateOrder = (query) =>
  query
    .populate('customer', 'name email phone')
    .populate('branch', 'name slug')
    .populate('payment', 'status method provider cashfreeStatus transactionReference screenshot paymentTime verifiedBy verifiedAt')
    .populate('items.menuItem', 'name slug');

const getAssignedBranchId = (worker) => worker.assignedBranch?._id || worker.assignedBranch;

const buildAdminFilter = (query) => {
  const filter = {};
  if (query.branch) filter.branch = query.branch;
  if (query.customer) filter.customer = query.customer;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus.toString().trim().toUpperCase();
  if (query.orderNumber) filter.orderNumber = query.orderNumber.toString().trim().toUpperCase();
  return filter;
};

const buildOrderItems = async ({ branch, items }) => {
  const branchDoc = await Branch.findOne({ _id: branch, isActive: true });
  if (!branchDoc) {
    throw new AppError('Active branch is required', 400);
  }

  const requestedIds = items.map((item) => item.menuItem);
  const menuItems = await MenuItem.find({
    _id: { $in: requestedIds },
    branch,
    isActive: true,
    isAvailable: true
  });

  if (menuItems.length !== new Set(requestedIds.map(String)).size) {
    throw new AppError('One or more menu items are unavailable for this branch', 400);
  }

  const menuItemMap = new Map(menuItems.map((item) => [item._id.toString(), item]));
  let subtotal = 0;

  const orderItems = items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItem.toString());
    const unitPrice = menuItem.offerPrice ?? menuItem.price;
    subtotal += unitPrice * item.quantity;

    return {
      menuItem: menuItem._id,
      nameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      offerPriceSnapshot: menuItem.offerPrice,
      imageSnapshot: menuItem.image?.url,
      preparationTimeSnapshot: menuItem.preparationTime,
      quantity: item.quantity
    };
  });

  return { orderItems, subtotal };
};

export const createOrder = async (payload, customerId) => {
  const { orderItems, subtotal } = await buildOrderItems(payload);
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: customerId,
    branch: payload.branch,
    items: orderItems,
    subtotal,
    totalAmount: subtotal,
    specialInstructions: payload.specialInstructions
  });

  if (env.customerPaymentMode === CUSTOMER_PAYMENT_MODE.PAY_AT_COUNTER) {
    try {
      await createCounterPayment({ order, customerId });
    } catch (error) {
      await Order.deleteOne({ _id: order._id });
      throw error;
    }
  }

  return getOrderById(order._id, { requesterId: customerId, isAdmin: false });
};

export const getOrders = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildAdminFilter(query);
  const sort = query.sort || '-createdAt';

  const [orders, total] = await Promise.all([
    populateOrder(Order.find(filter).sort(sort).skip(skip).limit(limit)),
    Order.countDocuments(filter)
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getCustomerOrders = async (customerId, query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    customer: customerId,
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus.toString().trim().toUpperCase() } : {})
  };

  const [orders, total] = await Promise.all([
    populateOrder(Order.find(filter).sort('-createdAt').skip(skip).limit(limit)),
    Order.countDocuments(filter)
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getOrderById = async (orderId, { requesterId, isAdmin }) => {
  const order = await populateOrder(Order.findById(orderId));
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (!isAdmin && order.customer._id.toString() !== requesterId.toString()) {
    throw new AppError('You do not have permission to access this order', 403);
  }

  return order;
};

export const getWorkerOrders = async (worker, query = {}) => {
  const assignedBranchId = getAssignedBranchId(worker);
  if (!assignedBranchId) {
    throw new AppError('Worker is not assigned to a branch', 403);
  }
  if (query.branch && query.branch.toString() !== assignedBranchId.toString()) {
    throw new AppError('You do not have permission to access this branch', 403);
  }

  const { page, limit, skip } = getPagination(query);
  const filter = {
    branch: assignedBranchId,
    paymentStatus: query.paymentStatus
      ? query.paymentStatus.toString().trim().toUpperCase()
      : PAYMENT_STATUS.PENDING_VERIFICATION
  };

  const [orders, total] = await Promise.all([
    populateOrder(Order.find(filter).sort('createdAt').skip(skip).limit(limit)),
    Order.countDocuments(filter)
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
