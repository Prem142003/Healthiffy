import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { Payment } from '../models/Payment.model.js';
import { PaymentSetting } from '../models/PaymentSetting.model.js';
import { Order } from '../models/Order.model.js';
import { AppError } from '../utils/AppError.js';

const populatePayment = (query) =>
  query
    .populate('order', 'orderNumber totalAmount paymentStatus orderStatus')
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
    isEnabled: settings?.isEnabled ?? true
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
  if (order.paymentStatus === PAYMENT_STATUS.PAID) throw new AppError('Order is already paid', 400);
  if (order.paymentStatus === PAYMENT_STATUS.PENDING_VERIFICATION) throw new AppError('Payment is already pending verification', 400);
  if (order.orderStatus === 'CANCELLED') throw new AppError('Cannot submit payment for a cancelled order', 400);
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

export const getPayments = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.status) filter.status = query.status.toString().trim().toUpperCase();
  if (query.branch) filter.branch = query.branch;
  if (query.customer) filter.customer = query.customer;

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

export const verifyPayment = async ({ paymentId, userId }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.status === PAYMENT_STATUS.PAID) throw new AppError('Payment is already verified', 400);

  payment.status = PAYMENT_STATUS.PAID;
  payment.verifiedBy = userId;
  payment.verifiedAt = new Date();
  payment.rejectionReason = undefined;
  await payment.save();

  await Order.findByIdAndUpdate(payment.order, {
    payment: payment._id,
    paymentStatus: PAYMENT_STATUS.PAID
  });

  return populatePayment(Payment.findById(payment._id));
};

export const rejectPayment = async ({ paymentId, reason, userId }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.status === PAYMENT_STATUS.PAID) throw new AppError('Verified payment cannot be rejected', 400);

  payment.status = PAYMENT_STATUS.REJECTED;
  payment.verifiedBy = userId;
  payment.verifiedAt = new Date();
  payment.rejectionReason = reason;
  await payment.save();

  await Order.findByIdAndUpdate(payment.order, {
    payment: payment._id,
    paymentStatus: PAYMENT_STATUS.REJECTED
  });

  return populatePayment(Payment.findById(payment._id));
};
