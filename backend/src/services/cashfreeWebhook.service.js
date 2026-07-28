import mongoose from 'mongoose';
import {
  CASHFREE_ORDER_STATUS,
  CASHFREE_WEBHOOK_TYPE,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER
} from '../constants/payment.constants.js';
import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { CashfreeWebhookEvent } from '../models/CashfreeWebhookEvent.model.js';
import { Order } from '../models/Order.model.js';
import { Payment } from '../models/Payment.model.js';
import { emitOrderUpdated } from '../sockets/socket.server.js';
import { fetchCashfreeOrder } from './cashfree.service.js';
import { confirmPayment } from './paymentConfirmation.service.js';
import { getOrderById } from './order.service.js';

export const registerCashfreeWebhook = async ({
  eventKey,
  type,
  cashfreeOrderId
}) => {
  try {
    const event = await CashfreeWebhookEvent.create({
      eventKey,
      type,
      cashfreeOrderId
    });
    return { event, duplicate: false };
  } catch (error) {
    if (error?.code !== 11000) throw error;

    const retry = await CashfreeWebhookEvent.findOneAndUpdate(
      { eventKey, status: 'FAILED' },
      {
        $set: {
          status: 'RECEIVED',
          lastError: undefined,
          type,
          cashfreeOrderId
        },
        $inc: { attempts: 1 }
      },
      { new: true }
    );

    return { event: retry, duplicate: !retry };
  }
};

const internalOrderIdFromCashfreeId = (cashfreeOrderId) => {
  const match = /^HF_([a-f\d]{24})_\d+$/i.exec(cashfreeOrderId || '');
  return match && mongoose.isValidObjectId(match[1]) ? match[1] : null;
};

const findPaymentForCashfreeOrder = async (cashfreeOrderId) => {
  const payment = await Payment.findOne({ cashfreeOrderId });
  if (payment) return payment;

  const orderId = internalOrderIdFromCashfreeId(cashfreeOrderId);
  return orderId ? Payment.findOne({ order: orderId }) : null;
};

const markCashfreeAttemptUnsuccessful = async ({ payment, payload, eventType }) => {
  if ([PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID].includes(payment.status)) return;

  const providerPayment = payload.data?.payment || {};
  const errorDetails = payload.data?.error_details || {};
  const status =
    eventType === CASHFREE_WEBHOOK_TYPE.USER_DROPPED
      ? 'USER_DROPPED'
      : providerPayment.payment_status || 'FAILED';
  const now = new Date();

  await Promise.all([
    Payment.findByIdAndUpdate(payment._id, {
      $set: {
        provider: PAYMENT_PROVIDER.CASHFREE,
        method: PAYMENT_METHOD.CASHFREE_CHECKOUT,
        status: PAYMENT_STATUS.REJECTED,
        cashfreeStatus: status,
        cashfreePaymentId: providerPayment.cf_payment_id?.toString(),
        providerSyncedAt: now,
        paymentTime: providerPayment.payment_time
          ? new Date(providerPayment.payment_time)
          : payment.paymentTime,
        rejectionReason:
          eventType === CASHFREE_WEBHOOK_TYPE.USER_DROPPED
            ? 'Payment was not completed'
            : 'Cashfree reported an unsuccessful payment',
        failureCode: errorDetails.error_code,
        failureReason: errorDetails.error_reason,
        failureSource: errorDetails.error_source
      }
    }),
    Order.findByIdAndUpdate(payment.order, {
      $set: {
        payment: payment._id,
        paymentStatus: PAYMENT_STATUS.REJECTED
      }
    })
  ]);

  const order = await getOrderById(payment.order, {
    requesterId: payment.customer,
    isAdmin: true
  });
  emitOrderUpdated(order);
};

const processPaymentSuccess = async ({ payment, payload, cashfreeOrderId }) => {
  const cashfreeOrder = await fetchCashfreeOrder(cashfreeOrderId);
  const providerPayment = payload.data?.payment || {};

  if (cashfreeOrder.order_status !== CASHFREE_ORDER_STATUS.PAID) {
    await Promise.all([
      Payment.findByIdAndUpdate(payment._id, {
        $set: {
          provider: PAYMENT_PROVIDER.CASHFREE,
          method: PAYMENT_METHOD.CASHFREE_CHECKOUT,
          status: PAYMENT_STATUS.PROCESSING,
          cashfreeOrderId,
          cashfreeStatus: cashfreeOrder.order_status || CASHFREE_ORDER_STATUS.ACTIVE,
          cashfreePaymentId: providerPayment.cf_payment_id?.toString(),
          providerSyncedAt: new Date()
        }
      }),
      Order.findByIdAndUpdate(payment.order, {
        $set: {
          payment: payment._id,
          paymentStatus: PAYMENT_STATUS.PROCESSING
        }
      })
    ]);
    return;
  }

  await Payment.findByIdAndUpdate(payment._id, {
    $set: {
      provider: PAYMENT_PROVIDER.CASHFREE,
      method: PAYMENT_METHOD.CASHFREE_CHECKOUT,
      cashfreeOrderId
    }
  });

  await confirmPayment({
    paymentId: payment._id,
    paymentStatus: PAYMENT_STATUS.PAID,
    confirmedAt: providerPayment.payment_time
      ? new Date(providerPayment.payment_time)
      : new Date(),
    cashfreeStatus: CASHFREE_ORDER_STATUS.PAID,
    cashfreePaymentId: providerPayment.cf_payment_id?.toString(),
    paymentMethod: PAYMENT_METHOD.CASHFREE_CHECKOUT
  });
};

export const processCashfreeWebhook = async ({ eventId, payload }) => {
  const event = await CashfreeWebhookEvent.findOneAndUpdate(
    { _id: eventId, status: 'RECEIVED' },
    { $set: { status: 'PROCESSING' } },
    { new: true }
  );
  if (!event) return;

  try {
    const cashfreeOrderId = payload.data?.order?.order_id;
    const payment = await findPaymentForCashfreeOrder(cashfreeOrderId);

    if (!payment) {
      throw new Error('Payment record was not found for Cashfree order');
    }

    if (payload.type === CASHFREE_WEBHOOK_TYPE.SUCCESS) {
      await processPaymentSuccess({ payment, payload, cashfreeOrderId });
    } else if (
      [CASHFREE_WEBHOOK_TYPE.FAILED, CASHFREE_WEBHOOK_TYPE.USER_DROPPED].includes(
        payload.type
      )
    ) {
      await markCashfreeAttemptUnsuccessful({
        payment,
        payload,
        eventType: payload.type
      });
    }

    await CashfreeWebhookEvent.findByIdAndUpdate(event._id, {
      $set: {
        status: 'PROCESSED',
        processedAt: new Date(),
        lastError: undefined
      }
    });
  } catch (error) {
    console.error('[cashfree] Webhook processing failed', {
      eventId: event._id.toString(),
      type: event.type,
      message: error.message,
      code: error.code
    });

    await CashfreeWebhookEvent.findByIdAndUpdate(event._id, {
      $set: {
        status: 'FAILED',
        lastError: error.message
      }
    });
  }
};
