import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { PAYMENT_METHOD, PAYMENT_PROVIDER } from '../constants/payment.constants.js';
import { Order } from '../models/Order.model.js';
import { Payment } from '../models/Payment.model.js';
import { AppError } from '../utils/AppError.js';

export const createCounterPayment = async ({ order, customerId }) => {
  const existingPayment = await Payment.findOne({ order: order._id });

  if (existingPayment) {
    if (
      existingPayment.method === PAYMENT_METHOD.PAY_AT_COUNTER &&
      existingPayment.status === PAYMENT_STATUS.PENDING_VERIFICATION
    ) {
      return existingPayment;
    }

    if ([PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(existingPayment.status)) {
      throw new AppError('Payment is already verified', 400);
    }

    throw new AppError('This order already has a different payment attempt', 409);
  }

  const payment = await Payment.create({
    order: order._id,
    customer: customerId,
    branch: order.branch,
    method: PAYMENT_METHOD.PAY_AT_COUNTER,
    provider: PAYMENT_PROVIDER.MANUAL,
    amount: order.totalAmount,
    status: PAYMENT_STATUS.PENDING_VERIFICATION
  });

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          payment: payment._id,
          paymentStatus: PAYMENT_STATUS.PENDING_VERIFICATION
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) throw new AppError('Order not found', 404);
    return payment;
  } catch (error) {
    await Payment.deleteOne({ _id: payment._id });
    throw error;
  }
};
