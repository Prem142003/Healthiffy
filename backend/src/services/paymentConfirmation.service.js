import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { Payment } from '../models/Payment.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { emitOrderUpdated, emitPaymentConfirmed } from '../sockets/socket.server.js';
import { AppError } from '../utils/AppError.js';
import { getOrderById } from './order.service.js';

const publicPaymentSummary = (user) => ({
  successfulPaymentCount: user.paymentSummary?.successfulPaymentCount || 0,
  totalPaidAmount: user.paymentSummary?.totalPaidAmount || 0,
  lastPaymentAt: user.paymentSummary?.lastPaymentAt,
  lastPaidOrder: user.paymentSummary?.lastPaidOrder
});

export const confirmPayment = async ({
  paymentId,
  paymentStatus,
  confirmedAt = new Date(),
  cashfreeStatus,
  cashfreePaymentId,
  paymentMethod
}) => {
  if (![PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(paymentStatus)) {
    throw new AppError('Confirmed payment status is invalid', 500);
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404);

  const order = await Order.findById(payment.order);
  if (!order) throw new AppError('Order not found', 404);

  const paymentUpdate = {
    status: paymentStatus,
    paymentTime: payment.paymentTime || confirmedAt,
    providerSyncedAt: confirmedAt,
    rejectionReason: undefined,
    failureCode: undefined,
    failureReason: undefined,
    failureSource: undefined,
    ...(cashfreeStatus ? { cashfreeStatus } : {}),
    ...(cashfreePaymentId ? { cashfreePaymentId } : {}),
    ...(paymentMethod ? { method: paymentMethod } : {})
  };

  const updatedPayment = await Payment.findByIdAndUpdate(
    payment._id,
    { $set: paymentUpdate },
    { new: true, runValidators: true }
  );

  await Order.findByIdAndUpdate(order._id, {
    $set: {
      payment: payment._id,
      paymentStatus
    }
  });

  const creditedUser = await User.findOneAndUpdate(
    {
      _id: payment.customer,
      'paymentSummary.creditedPayments': { $ne: payment._id }
    },
    {
      $inc: {
        'paymentSummary.successfulPaymentCount': 1,
        'paymentSummary.totalPaidAmount': payment.amount
      },
      $set: {
        'paymentSummary.lastPaymentAt': confirmedAt,
        'paymentSummary.lastPaidOrder': order._id
      },
      $addToSet: {
        'paymentSummary.creditedPayments': payment._id
      }
    },
    { new: true, runValidators: true }
  );

  const updatedOrder = await getOrderById(order._id, {
    requesterId: payment.customer,
    isAdmin: true
  });

  if (creditedUser) {
    const paymentSummary = publicPaymentSummary(creditedUser);
    emitOrderUpdated(updatedOrder);
    emitPaymentConfirmed({
      order: updatedOrder,
      payment: updatedPayment,
      paymentSummary
    });
  }

  return {
    payment: updatedPayment,
    order: updatedOrder,
    paymentSummary: creditedUser ? publicPaymentSummary(creditedUser) : null,
    firstConfirmation: Boolean(creditedUser)
  };
};
