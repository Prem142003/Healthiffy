import crypto from 'crypto';
import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  createCashfreeSession,
  getPaymentSettings,
  getPayments,
  rejectPayment,
  submitManualPayment,
  syncCashfreePaymentStatus,
  updatePaymentSettings,
  verifyPayment
} from '../services/payment.service.js';
import {
  processCashfreeWebhook,
  registerCashfreeWebhook
} from '../services/cashfreeWebhook.service.js';
import { verifyCashfreeWebhookSignature } from '../services/cashfree.service.js';
import {
  validateManualPayment,
  validatePaymentSettings,
  validateRejectPayment
} from '../validators/payment.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const getPublicPaymentSettingsHandler = catchAsync(async (_req, res) => {
  const settings = await getPaymentSettings();
  sendSuccess(res, 200, 'Payment settings fetched', { settings });
});

export const updatePaymentSettingsHandler = catchAsync(async (req, res) => {
  const payload = validatePaymentSettings(req.body);
  const settings = await updatePaymentSettings(payload, req.user._id);
  sendSuccess(res, 200, 'Payment settings updated', { settings });
});

export const submitManualPaymentHandler = catchAsync(async (req, res) => {
  const payload = validateManualPayment(req.body);
  const payment = await submitManualPayment({
    orderId: req.params.orderId,
    customerId: req.user._id,
    payload
  });
  sendSuccess(res, 201, 'Payment submitted for verification', { payment });
});

export const createCashfreeSessionHandler = catchAsync(async (req, res) => {
  const session = await createCashfreeSession({
    orderId: req.params.orderId,
    user: req.user,
    customerPhone: req.body.customerPhone
  });
  sendSuccess(res, 201, 'Cashfree payment session created', session);
});

export const getCashfreeStatusHandler = catchAsync(async (req, res) => {
  const result = await syncCashfreePaymentStatus({
    orderId: req.params.orderId,
    user: req.user
  });
  sendSuccess(res, 200, 'Cashfree payment status fetched', result);
});

export const cashfreeWebhookHandler = async (req, res, next) => {
  try {
    const rawBody = req.body;
    const signature = req.get('x-webhook-signature');
    const timestamp = req.get('x-webhook-timestamp');

    if (
      !verifyCashfreeWebhookSignature({
        timestamp,
        rawBody,
        signature
      })
    ) {
      throw new AppError('Invalid Cashfree webhook signature', 400);
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch (_error) {
      throw new AppError('Cashfree webhook payload is invalid', 400);
    }

    if (!payload.type || !payload.data?.order?.order_id) {
      throw new AppError('Cashfree webhook payload is incomplete', 400);
    }

    const eventKey =
      req.get('x-idempotency-key') ||
      crypto.createHash('sha256').update(rawBody).digest('hex');
    const { event, duplicate } = await registerCashfreeWebhook({
      eventKey,
      type: payload.type,
      cashfreeOrderId: payload.data.order.order_id
    });

    if (!duplicate && event) {
      await processCashfreeWebhook({
        eventId: event._id,
        payload
      });
    }

    res.status(200).json({
      success: true,
      message: duplicate ? 'Webhook already received' : 'Webhook processed'
    });
  } catch (error) {
    next(error);
  }
};

export const listPaymentsHandler = catchAsync(async (req, res) => {
  const data = await getPayments(req.query, req.user);
  sendSuccess(res, 200, 'Payments fetched', data);
});

export const verifyPaymentHandler = catchAsync(async (req, res) => {
  const payment = await verifyPayment({ paymentId: req.params.id, user: req.user });
  sendSuccess(res, 200, 'Payment verified', { payment });
});

export const rejectPaymentHandler = catchAsync(async (req, res) => {
  const payload = validateRejectPayment(req.body);
  const payment = await rejectPayment({
    paymentId: req.params.id,
    reason: payload.reason,
    user: req.user
  });
  sendSuccess(res, 200, 'Payment rejected', { payment });
});
