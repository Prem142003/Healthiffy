import { PAYMENT_STATUS } from '../constants/order.constants.js';
import {
  CASHFREE_ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER
} from '../constants/payment.constants.js';
import { Payment } from '../models/Payment.model.js';
import { PaymentSetting } from '../models/PaymentSetting.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { getOrderById } from './order.service.js';
import { emitOrderUpdated } from '../sockets/socket.server.js';
import { AppError } from '../utils/AppError.js';
import {
  createHealthiffyCheckoutOrder,
  fetchCashfreeOrder,
  getCashfreePublicSettings
} from './cashfree.service.js';
import { confirmPayment } from './paymentConfirmation.service.js';

const getAssignedBranchId = (user) => user.assignedBranch?._id || user.assignedBranch;

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
    cashfree: getCashfreePublicSettings()
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
      order: order._id,
      customer: customerId,
      branch: order.branch,
      amount: order.totalAmount,
      upiIdSnapshot: settings.upiId,
      qrCodeSnapshot: settings.qrCode,
      transactionReference: payload.transactionReference,
      customerNote: payload.customerNote,
      screenshot: payload.screenshot,
      paymentTime: new Date(),
      method: PAYMENT_METHOD.UPI_MANUAL,
      provider: PAYMENT_PROVIDER.MANUAL,
      status: PAYMENT_STATUS.PENDING_VERIFICATION,
      rejectionReason: undefined,
      verifiedBy: undefined,
      verifiedAt: undefined
    },
    { new: true, upsert: true, runValidators: true }
  );

  order.payment = payment._id;
  order.paymentStatus = PAYMENT_STATUS.PENDING_VERIFICATION;
  await order.save();

  return populatePayment(Payment.findById(payment._id));
};

const normalizeIndianPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  const normalized = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(normalized) ? normalized : null;
};

const assertOrderPaymentAccess = (order, user) => {
  const customerId = order.customer?._id || order.customer;
  if (user.role !== 'ADMIN' && customerId.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to pay for this order', 403);
  }
};

const cashfreeOrderIdFor = (orderId) => `HF_${orderId}_${Date.now()}`;

const safeCashfreeSession = (payment) => ({
  paymentSessionId: payment.cashfreePaymentSessionId,
  cashfreeOrderId: payment.cashfreeOrderId,
  environment: getCashfreePublicSettings().environment,
  amount: payment.amount,
  status: payment.status
});

export const createCashfreeSession = async ({ orderId, user, customerPhone }) => {
  const order = await Order.findById(orderId).populate('customer', 'name email phone');
  if (!order) throw new AppError('Order not found', 404);
  assertOrderPaymentAccess(order, user);

  if ([PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(order.paymentStatus)) {
    throw new AppError('Order is already paid', 400);
  }
  if (order.paymentStatus === PAYMENT_STATUS.PENDING_VERIFICATION) {
    throw new AppError('Manual payment is already pending verification', 400);
  }
  if (order.totalAmount < 1) {
    throw new AppError('Cashfree requires a minimum payment amount of Rs. 1', 400);
  }

  const phone = normalizeIndianPhone(customerPhone || order.customer.phone);
  if (!phone) {
    throw new AppError('A valid 10-digit Indian mobile number is required', 400);
  }

  const existingPayment = await Payment.findOne({ order: order._id }).select(
    '+cashfreePaymentSessionId'
  );
  const sessionAge = existingPayment?.cashfreeSessionCreatedAt
    ? Date.now() - existingPayment.cashfreeSessionCreatedAt.getTime()
    : Number.POSITIVE_INFINITY;

  if (
    existingPayment?.provider === PAYMENT_PROVIDER.CASHFREE &&
    existingPayment.status === PAYMENT_STATUS.PROCESSING &&
    existingPayment.cashfreePaymentSessionId &&
    sessionAge < 10 * 60 * 1000
  ) {
    return safeCashfreeSession(existingPayment);
  }

  const cashfreeOrderId = cashfreeOrderIdFor(order._id);
  const cashfreeOrder = await createHealthiffyCheckoutOrder(
    {
      cashfreeOrderId,
      amount: order.totalAmount,
      customer: order.customer,
      customerPhone: phone,
      note: `Healthiffy order ${order.orderNumber}`
    },
    `healthiffy:${cashfreeOrderId}`
  );

  if (!cashfreeOrder.payment_session_id) {
    throw new AppError('Cashfree did not return a payment session', 502);
  }

  const payment = await Payment.findOneAndUpdate(
    { order: order._id },
    {
      $set: {
        order: order._id,
        customer: order.customer._id,
        branch: order.branch,
        method: PAYMENT_METHOD.CASHFREE_CHECKOUT,
        provider: PAYMENT_PROVIDER.CASHFREE,
        amount: order.totalAmount,
        status: PAYMENT_STATUS.PROCESSING,
        cashfreeOrderId,
        cashfreePaymentSessionId: cashfreeOrder.payment_session_id,
        cashfreeStatus: cashfreeOrder.order_status || CASHFREE_ORDER_STATUS.ACTIVE,
        cashfreeSessionCreatedAt: new Date(),
        providerSyncedAt: new Date(),
        rejectionReason: undefined,
        failureCode: undefined,
        failureReason: undefined,
        failureSource: undefined
      }
    },
    { new: true, upsert: true, runValidators: true }
  ).select('+cashfreePaymentSessionId');

  await Promise.all([
    Order.findByIdAndUpdate(order._id, {
      $set: {
        payment: payment._id,
        paymentStatus: PAYMENT_STATUS.PROCESSING
      }
    }),
    order.customer.phone === phone
      ? Promise.resolve()
      : User.findByIdAndUpdate(order.customer._id, { $set: { phone } })
  ]);

  return safeCashfreeSession(payment);
};

export const syncCashfreePaymentStatus = async ({ orderId, user }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  assertOrderPaymentAccess(order, user);

  const payment = await Payment.findOne({
    order: order._id,
    provider: PAYMENT_PROVIDER.CASHFREE
  });
  if (!payment?.cashfreeOrderId) {
    throw new AppError('Cashfree payment session was not found for this order', 404);
  }

  const cashfreeOrder = await fetchCashfreeOrder(payment.cashfreeOrderId);
  const providerStatus = cashfreeOrder.order_status;
  const syncedAt = new Date();

  if (providerStatus === CASHFREE_ORDER_STATUS.PAID) {
    const confirmed = await confirmPayment({
      paymentId: payment._id,
      paymentStatus: PAYMENT_STATUS.PAID,
      confirmedAt: cashfreeOrder.order_meta?.payment_time
        ? new Date(cashfreeOrder.order_meta.payment_time)
        : syncedAt,
      cashfreeStatus: providerStatus
    });

    return {
      status: PAYMENT_STATUS.PAID,
      providerStatus,
      payment: await populatePayment(Payment.findById(confirmed.payment._id))
    };
  }

  const terminal = [
    CASHFREE_ORDER_STATUS.FAILED,
    CASHFREE_ORDER_STATUS.EXPIRED,
    CASHFREE_ORDER_STATUS.TERMINATED
  ].includes(providerStatus);
  const paymentStatus = terminal ? PAYMENT_STATUS.REJECTED : PAYMENT_STATUS.PROCESSING;

  await Promise.all([
    Payment.findByIdAndUpdate(payment._id, {
      $set: {
        status: paymentStatus,
        cashfreeStatus: providerStatus,
        providerSyncedAt: syncedAt,
        ...(terminal ? { rejectionReason: `Cashfree order ${providerStatus.toLowerCase()}` } : {})
      }
    }),
    Order.findByIdAndUpdate(order._id, {
      $set: {
        payment: payment._id,
        paymentStatus
      }
    })
  ]);

  return {
    status: paymentStatus,
    providerStatus,
    payment: await populatePayment(Payment.findById(payment._id))
  };
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

  await confirmPayment({
    paymentId: payment._id,
    paymentStatus: PAYMENT_STATUS.VERIFIED,
    confirmedAt: payment.verifiedAt
  });
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
