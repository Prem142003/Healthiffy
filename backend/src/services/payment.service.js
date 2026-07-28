import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { PAYMENT_METHOD, PAYMENT_PROVIDER } from '../constants/payment.constants.js';
import {
  cashfreePublicConfig,
  createCashfreeOrder,
  fetchCashfreeOrder
} from '../config/cashfree.config.js';
import { env } from '../config/env.config.js';
import { CashfreeWebhookEvent } from '../models/CashfreeWebhookEvent.model.js';
import { Payment } from '../models/Payment.model.js';
import { PaymentSetting } from '../models/PaymentSetting.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { getOrderById } from './order.service.js';
import { emitOrderUpdated, emitPaymentConfirmed } from '../sockets/socket.server.js';
import { AppError } from '../utils/AppError.js';

const getAssignedBranchId = (user) => user.assignedBranch?._id || user.assignedBranch;

export const normalizeCashfreePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  const normalized = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    throw new AppError('Enter a valid 10-digit Indian mobile number to pay with Cashfree', 400);
  }
  return normalized;
};

const assertCashfreeOrderAccess = (order, user) => {
  if (user.role === 'ADMIN') return;
  const customerId = order.customer?._id || order.customer;
  if (customerId.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to pay for this order', 403);
  }
};

const getCashfreeErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.type ||
  (error instanceof AppError ? error.message : fallback);

const emitPaymentOrderUpdate = async (order) => {
  const customerId = order.customer?._id || order.customer;
  const updatedOrder = await getOrderById(order._id, {
    requesterId: customerId,
    isAdmin: false
  });
  emitOrderUpdated(updatedOrder);
  return updatedOrder;
};

const creditCustomerPaymentProfile = async ({ order, payment }) => {
  const customerId = order.customer?._id || order.customer;
  const paidAt = payment.paymentTime || new Date();
  const user = await User.findOneAndUpdate(
    {
      _id: customerId,
      'paymentSummary.creditedPayments': { $ne: payment._id }
    },
    {
      $inc: {
        'paymentSummary.successfulPaymentCount': 1,
        'paymentSummary.totalPaidAmount': payment.amount
      },
      $set: {
        'paymentSummary.lastPaymentAt': paidAt,
        'paymentSummary.lastPaidOrder': order._id
      },
      $addToSet: {
        'paymentSummary.creditedPayments': payment._id
      }
    },
    { new: true }
  ).select('paymentSummary');

  if (!user) return null;
  return {
    successfulPaymentCount: user.paymentSummary?.successfulPaymentCount || 0,
    totalPaidAmount: user.paymentSummary?.totalPaidAmount || 0,
    lastPaymentAt: user.paymentSummary?.lastPaymentAt,
    lastPaidOrder: user.paymentSummary?.lastPaidOrder
  };
};

const publishPaymentConfirmation = async ({ order, payment }) => {
  const [updatedOrder, paymentSummary] = await Promise.all([
    emitPaymentOrderUpdate(order),
    creditCustomerPaymentProfile({ order, payment })
  ]);

  if (paymentSummary) {
    emitPaymentConfirmed({ order: updatedOrder, payment, paymentSummary });
  }
  return updatedOrder;
};

const populatePayment = (query) =>
  query
    .populate('order', 'orderNumber totalAmount paymentStatus')
    .populate('customer', 'name email phone')
    .populate('branch', 'name slug')
    .populate('verifiedBy', 'name email');

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getPaymentSettings = async () => {
  const settings = await PaymentSetting.findOne().sort('-updatedAt');
  return {
    upiId: settings?.upiId || '',
    qrCode: settings?.qrCode,
    isEnabled: settings?.isEnabled ?? true,
    cashfree: cashfreePublicConfig
  };
};

export const updatePaymentSettings = async (payload, userId) => {
  const current = await PaymentSetting.findOne().sort('-updatedAt');
  const data = {
    upiId: payload.upiId ?? current?.upiId,
    qrCode: payload.qrCode ?? current?.qrCode,
    isEnabled: payload.isEnabled ?? current?.isEnabled ?? true,
    updatedBy: userId
  };

  const settings = current
    ? await PaymentSetting.findByIdAndUpdate(current._id, data, { new: true, runValidators: true })
    : await PaymentSetting.create(data);

  return settings;
};

export const submitManualPayment = async ({ orderId, customerId, payload }) => {
  const [order, settings] = await Promise.all([
    Order.findOne({ _id: orderId, customer: customerId }),
    PaymentSetting.findOne().sort('-updatedAt')
  ]);

  if (!order) throw new AppError('Order not found', 404);
  if ([PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(order.paymentStatus)) throw new AppError('Order is already verified', 400);
  if (order.paymentStatus === PAYMENT_STATUS.PENDING_VERIFICATION) throw new AppError('Payment is already pending verification', 400);
  if (!settings?.isEnabled || !settings.upiId) throw new AppError('UPI payment is not configured', 400);

  const payment = await Payment.findOneAndUpdate(
    { order: order._id },
    {
      $set: {
        order: order._id,
        customer: customerId,
        branch: order.branch,
        method: PAYMENT_METHOD.UPI_MANUAL,
        provider: PAYMENT_PROVIDER.MANUAL,
        amount: order.totalAmount,
        upiIdSnapshot: settings.upiId,
        qrCodeSnapshot: settings.qrCode,
        transactionReference: payload.transactionReference,
        customerNote: payload.customerNote,
        screenshot: payload.screenshot,
        paymentTime: new Date(),
        status: PAYMENT_STATUS.PENDING_VERIFICATION
      },
      $unset: {
        rejectionReason: 1,
        verifiedBy: 1,
        verifiedAt: 1,
        cashfreeOrderId: 1,
        cashfreeOrderIds: 1,
        cashfreePaymentId: 1,
        cashfreePaymentGroup: 1,
        gatewayStatus: 1,
        gatewayErrorCode: 1
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  order.payment = payment._id;
  order.paymentStatus = PAYMENT_STATUS.PENDING_VERIFICATION;
  await order.save();

  return populatePayment(Payment.findById(payment._id));
};

export const createCashfreePaymentSession = async ({ orderId, user, customerPhone }) => {
  const order = await Order.findById(orderId).populate('customer', 'name email phone');
  if (!order) throw new AppError('Order not found', 404);
  assertCashfreeOrderAccess(order, user);

  if ([PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(order.paymentStatus)) {
    throw new AppError('Order is already paid', 400);
  }
  if (order.totalAmount < 1) {
    throw new AppError('Cashfree requires an order amount of at least ₹1', 400);
  }

  const phone = normalizeCashfreePhone(customerPhone || order.customer.phone || user.phone);
  const cashfreeOrderId = `hf_${order._id}_${Date.now().toString(36)}`;
  const orderMeta = env.cashfree.webhookUrl
    ? { notify_url: env.cashfree.webhookUrl }
    : undefined;

  const request = {
    order_id: cashfreeOrderId,
    order_amount: Number(order.totalAmount.toFixed(2)),
    order_currency: 'INR',
    customer_details: {
      customer_id: order.customer._id.toString(),
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: phone
    },
    order_note: `Healthiffy order ${order.orderNumber}`,
    payment_methods_filters: {
      methods: {
        action: 'ALLOW',
        values: ['upi', 'credit_card', 'debit_card', 'prepaid_card']
      }
    },
    ...(orderMeta ? { order_meta: orderMeta } : {})
  };

  let cashfreeOrder;
  try {
    cashfreeOrder = await createCashfreeOrder(request);
  } catch (error) {
    throw new AppError(getCashfreeErrorMessage(error, 'Unable to start Cashfree checkout'), 502);
  }

  const payment = await Payment.findOneAndUpdate(
    { order: order._id },
    {
      $set: {
        order: order._id,
        customer: order.customer._id,
        branch: order.branch,
        method: PAYMENT_METHOD.CASHFREE,
        provider: PAYMENT_PROVIDER.CASHFREE,
        amount: order.totalAmount,
        status: PAYMENT_STATUS.PROCESSING,
        cashfreeOrderId,
        gatewayStatus: cashfreeOrder.order_status || 'ACTIVE'
      },
      $addToSet: {
        cashfreeOrderIds: cashfreeOrderId
      },
      $unset: {
        upiIdSnapshot: 1,
        qrCodeSnapshot: 1,
        transactionReference: 1,
        customerNote: 1,
        screenshot: 1,
        rejectionReason: 1,
        gatewayErrorCode: 1
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  order.payment = payment._id;
  order.paymentStatus = PAYMENT_STATUS.PROCESSING;
  await order.save();

  return {
    paymentSessionId: cashfreeOrder.payment_session_id,
    cashfreeOrderId,
    orderId: order._id,
    orderNumber: order.orderNumber,
    amount: order.totalAmount,
    mode: cashfreePublicConfig.mode
  };
};

const applyCashfreeOrderStatus = async (payment, cashfreeOrder) => {
  const order = await Order.findById(payment.order);
  if (!order) throw new AppError('Order not found', 404);

  if (cashfreeOrder.order_status === 'PAID') {
    const paidAt = payment.paymentTime || new Date();
    const updatedPayment = await Payment.findByIdAndUpdate(
      payment._id,
      {
        $set: {
          status: PAYMENT_STATUS.PAID,
          paymentTime: paidAt,
          gatewayStatus: cashfreeOrder.order_status,
          ...(cashfreeOrder.order_id ? { cashfreeOrderId: cashfreeOrder.order_id } : {})
        },
        $unset: {
          rejectionReason: 1,
          gatewayErrorCode: 1
        }
      },
      { new: true, runValidators: true }
    );

    order.payment = updatedPayment._id;
    order.paymentStatus = PAYMENT_STATUS.PAID;
    await order.save();
    await publishPaymentConfirmation({ order, payment: updatedPayment });
  } else if (cashfreeOrder.order_status === 'ACTIVE') {
    payment.status = PAYMENT_STATUS.PROCESSING;
    payment.gatewayStatus = cashfreeOrder.order_status;
    if (cashfreeOrder.order_id) payment.cashfreeOrderId = cashfreeOrder.order_id;
    if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
      order.paymentStatus = PAYMENT_STATUS.PROCESSING;
    }
    await Promise.all([payment.save(), order.save()]);
    await emitPaymentOrderUpdate(order);
  } else if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    payment.status = PAYMENT_STATUS.REJECTED;
    payment.gatewayStatus = cashfreeOrder.order_status;
    if (cashfreeOrder.order_id) payment.cashfreeOrderId = cashfreeOrder.order_id;
    order.paymentStatus = PAYMENT_STATUS.REJECTED;
    await Promise.all([payment.save(), order.save()]);
    await emitPaymentOrderUpdate(order);
  }

  return {
    status: cashfreeOrder.order_status,
    paymentStatus: order.paymentStatus,
    paid: cashfreeOrder.order_status === 'PAID'
  };
};

export const verifyCashfreePayment = async ({ orderId, user }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  assertCashfreeOrderAccess(order, user);

  const payment = await Payment.findOne({
    order: order._id,
    provider: PAYMENT_PROVIDER.CASHFREE
  });
  if (!payment?.cashfreeOrderId) {
    throw new AppError('No Cashfree payment session exists for this order', 404);
  }

  try {
    const orderIds = payment.cashfreeOrderIds?.length
      ? payment.cashfreeOrderIds
      : [payment.cashfreeOrderId];
    const responses = await Promise.all(
      orderIds.map((cashfreeOrderId) => fetchCashfreeOrder(cashfreeOrderId))
    );
    const authoritativeOrder =
      responses.find((response) => response.order_status === 'PAID') ||
      responses.find((response) => response.order_id === payment.cashfreeOrderId) ||
      responses.at(-1);
    return applyCashfreeOrderStatus(payment, authoritativeOrder);
  } catch (error) {
    throw new AppError(getCashfreeErrorMessage(error, 'Unable to verify Cashfree payment'), 502);
  }
};

const recordFailedCashfreeAttempt = async (payment, payload) => {
  const order = await Order.findById(payment.order);
  if (!order || order.paymentStatus === PAYMENT_STATUS.PAID) return;
  if (payload.data?.order?.order_id !== payment.cashfreeOrderId) return;

  const gatewayPayment = payload.data?.payment;
  const errorDetails = payload.data?.error_details;
  payment.status = PAYMENT_STATUS.REJECTED;
  payment.gatewayStatus = gatewayPayment?.payment_status || payload.type;
  payment.cashfreePaymentId = gatewayPayment?.cf_payment_id;
  payment.cashfreePaymentGroup = gatewayPayment?.payment_group;
  payment.gatewayErrorCode = errorDetails?.error_code;
  payment.rejectionReason =
    payload.type === 'PAYMENT_USER_DROPPED_WEBHOOK'
      ? 'Payment was not completed'
      : 'Cashfree payment attempt was unsuccessful';
  order.paymentStatus = PAYMENT_STATUS.REJECTED;

  await Promise.all([payment.save(), order.save()]);
  await emitPaymentOrderUpdate(order);
};

export const processCashfreeWebhook = async ({ payload, eventKey }) => {
  let event;
  try {
    event = await CashfreeWebhookEvent.create({
      eventKey,
      eventType: payload.type || 'UNKNOWN',
      cashfreeOrderId: payload.data?.order?.order_id
    });
  } catch (error) {
    if (error.code === 11000) return;
    throw error;
  }

  try {
    const cashfreeOrderId = payload.data?.order?.order_id;
    const payment = cashfreeOrderId
      ? await Payment.findOne({
          provider: PAYMENT_PROVIDER.CASHFREE,
          $or: [{ cashfreeOrderId }, { cashfreeOrderIds: cashfreeOrderId }]
        })
      : null;

    if (!payment) {
      event.status = 'IGNORED';
    } else if (
      payload.type === 'PAYMENT_SUCCESS_WEBHOOK' &&
      payload.data?.payment?.payment_status === 'SUCCESS'
    ) {
      payment.cashfreePaymentId = payload.data.payment.cf_payment_id;
      payment.cashfreePaymentGroup = payload.data.payment.payment_group;
      const cashfreeOrder = await fetchCashfreeOrder(cashfreeOrderId);
      await applyCashfreeOrderStatus(payment, cashfreeOrder);
      event.status = 'PROCESSED';
    } else if (
      payload.type === 'PAYMENT_FAILED_WEBHOOK' ||
      payload.type === 'PAYMENT_USER_DROPPED_WEBHOOK'
    ) {
      await recordFailedCashfreeAttempt(payment, payload);
      event.status = 'PROCESSED';
    } else {
      event.status = 'IGNORED';
    }

    event.processedAt = new Date();
    await event.save();
  } catch (error) {
    event.status = 'FAILED';
    event.errorMessage = getCashfreeErrorMessage(error, 'Webhook processing failed');
    event.processedAt = new Date();
    await event.save();
    throw error;
  }
};

export const getPayments = async (query = {}, user) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.status) filter.status = query.status.toString().trim().toUpperCase();
  if (query.branch) filter.branch = query.branch;
  if (query.customer) filter.customer = query.customer;
  if (query.worker) filter.verifiedBy = query.worker;
  if (query.date) {
    const date = new Date(query.date);
    if (Number.isNaN(date.getTime())) throw new AppError('Payment date is invalid', 400);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    filter.createdAt = { $gte: date, $lt: nextDate };
  }

  if (user?.role === 'WORKER') {
    const assignedBranchId = getAssignedBranchId(user);
    if (!assignedBranchId) throw new AppError('Worker is not assigned to a branch', 403);
    if (query.branch && query.branch.toString() !== assignedBranchId.toString()) {
      throw new AppError('You do not have permission to access this branch', 403);
    }
    filter.branch = assignedBranchId;
  }

  const [payments, total] = await Promise.all([
    populatePayment(Payment.find(filter).sort(query.sort || '-createdAt').skip(skip).limit(limit)),
    Payment.countDocuments(filter)
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const assertPaymentBranchAccess = (payment, user) => {
  if (user?.role !== 'WORKER') return;

  const assignedBranchId = getAssignedBranchId(user);
  if (!assignedBranchId) throw new AppError('Worker is not assigned to a branch', 403);
  if (payment.branch.toString() !== assignedBranchId.toString()) {
    throw new AppError('You do not have permission to access this branch', 403);
  }
};

export const verifyPayment = async ({ paymentId, user }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404);
  assertPaymentBranchAccess(payment, user);
  if ([PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(payment.status)) throw new AppError('Payment is already verified', 400);

  payment.status = PAYMENT_STATUS.VERIFIED;
  payment.verifiedBy = user._id;
  payment.verifiedAt = new Date();
  payment.rejectionReason = undefined;
  await payment.save();

  await Order.findByIdAndUpdate(payment.order, {
    payment: payment._id,
    paymentStatus: PAYMENT_STATUS.VERIFIED
  });

  const updatedOrder = await getOrderById(payment.order, { requesterId: user._id, isAdmin: true });
  const paymentSummary = await creditCustomerPaymentProfile({ order: updatedOrder, payment });
  emitOrderUpdated(updatedOrder);
  if (paymentSummary) {
    emitPaymentConfirmed({ order: updatedOrder, payment, paymentSummary });
  }
  return populatePayment(Payment.findById(payment._id));
};

export const rejectPayment = async ({ paymentId, reason, user }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404);
  assertPaymentBranchAccess(payment, user);
  if ([PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(payment.status)) throw new AppError('Verified payment cannot be rejected', 400);

  payment.status = PAYMENT_STATUS.REJECTED;
  payment.verifiedBy = user._id;
  payment.verifiedAt = new Date();
  payment.rejectionReason = reason;
  await payment.save();

  await Order.findByIdAndUpdate(payment.order, {
    payment: payment._id,
    paymentStatus: PAYMENT_STATUS.REJECTED
  });

  const updatedOrder = await getOrderById(payment.order, { requesterId: user._id, isAdmin: true });
  emitOrderUpdated(updatedOrder);
  return populatePayment(Payment.findById(payment._id));
};
