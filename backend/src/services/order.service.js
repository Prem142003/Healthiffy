import { ORDER_STATUS, ORDER_STATUS_FLOW, PAYMENT_STATUS } from '../constants/order.constants.js';
import { generateOrderNumber } from '../helpers/orderNumber.helper.js';
import { Branch } from '../models/Branch.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Order } from '../models/Order.model.js';
import { emitOrderUpdated } from '../sockets/socket.server.js';
import { AppError } from '../utils/AppError.js';

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
    .populate('items.menuItem', 'name slug');

const buildAdminFilter = (query) => {
  const filter = {};
  if (query.branch) filter.branch = query.branch;
  if (query.customer) filter.customer = query.customer;
  if (query.orderStatus) filter.orderStatus = query.orderStatus.toString().trim().toUpperCase();
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
    specialInstructions: payload.specialInstructions,
    statusHistory: [
      {
        status: ORDER_STATUS.PENDING,
        changedBy: customerId,
        note: 'Order placed'
      }
    ]
  });

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
    ...(query.orderStatus ? { orderStatus: query.orderStatus.toString().trim().toUpperCase() } : {})
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

export const updateOrderStatus = async ({ orderId, status, note, userId }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (!ORDER_STATUS_FLOW[order.orderStatus].includes(status)) {
    throw new AppError(`Order cannot move from ${order.orderStatus} to ${status}`, 400);
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, changedBy: userId, note });

  if (status === ORDER_STATUS.PREPARING) order.preparedAt = new Date();
  if (status === ORDER_STATUS.SERVED) order.servedAt = new Date();
  if (status === ORDER_STATUS.CANCELLED) order.cancelledAt = new Date();

  await order.save();
  const updatedOrder = await getOrderById(order._id, { requesterId: userId, isAdmin: true });
  emitOrderUpdated(updatedOrder);
  return updatedOrder;
};

export const getWorkerOrders = async (worker, query = {}) => {
  if (!worker.assignedBranch) {
    throw new AppError('Worker is not assigned to a branch', 403);
  }

  const { page, limit, skip } = getPagination(query);
  const filter = {
    branch: worker.assignedBranch,
    paymentStatus: PAYMENT_STATUS.PAID,
    orderStatus: query.orderStatus
      ? query.orderStatus.toString().trim().toUpperCase()
      : { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.READY] }
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

export const updateWorkerOrderStatus = async ({ orderId, status, note, worker }) => {
  if (!worker.assignedBranch) {
    throw new AppError('Worker is not assigned to a branch', 403);
  }

  const order = await Order.findOne({ _id: orderId, branch: worker.assignedBranch });
  if (!order) throw new AppError('Order not found for assigned branch', 404);
  if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    throw new AppError('Workers can only prepare paid orders', 400);
  }
  if (![ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.SERVED].includes(status)) {
    throw new AppError('Worker status must be PREPARING, READY, or SERVED', 400);
  }
  if (!ORDER_STATUS_FLOW[order.orderStatus].includes(status)) {
    throw new AppError(`Order cannot move from ${order.orderStatus} to ${status}`, 400);
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, changedBy: worker._id, note });
  if (status === ORDER_STATUS.PREPARING) order.preparedAt = new Date();
  if (status === ORDER_STATUS.SERVED) order.servedAt = new Date();

  await order.save();
  const updatedOrder = await getOrderById(order._id, { requesterId: worker._id, isAdmin: true });
  emitOrderUpdated(updatedOrder);
  return updatedOrder;
};

export const cancelCustomerOrder = async ({ orderId, customerId, note }) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) throw new AppError('Order not found', 404);

  if (order.orderStatus !== ORDER_STATUS.PENDING) {
    throw new AppError('Only pending orders can be cancelled', 400);
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    changedBy: customerId,
    note: note || 'Cancelled by customer'
  });

  await order.save();
  return getOrderById(order._id, { requesterId: customerId, isAdmin: false });
};
