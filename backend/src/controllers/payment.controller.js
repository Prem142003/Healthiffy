import crypto from 'node:crypto';
import { sendSuccess } from '../helpers/apiResponse.helper.js';
import { verifyCashfreeWebhookSignature } from '../config/cashfree.config.js';
import {
  createCashfreePaymentSession,
  getPaymentSettings,
  getPayments,
  processCashfreeWebhook,
  rejectPayment,
  submitManualPayment,
  updatePaymentSettings,
  verifyCashfreePayment,
  verifyPayment
} from '../services/payment.service.js';
import {
  validateManualPayment,
  validatePaymentSettings,
  validateRejectPayment
} from '../validators/payment.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

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

export const createCashfreePaymentSessionHandler = catchAsync(async (req, res) => {
  const session = await createCashfreePaymentSession({
    orderId: req.params.orderId,
    user: req.user,
    customerPhone: req.body.customerPhone
  });
  sendSuccess(res, 201, 'Cashfree payment session created', { session });
});

export const verifyCashfreePaymentHandler = catchAsync(async (req, res) => {
  const verification = await verifyCashfreePayment({
    orderId: req.params.orderId,
    user: req.user
  });
  sendSuccess(res, 200, 'Cashfree payment status verified', { verification });
});

export const cashfreeWebhookHandler = (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const rawBody = req.rawBody;

  if (!signature || !timestamp || !rawBody) {
    return res.status(400).json({ success: false, message: 'Invalid webhook request' });
  }

  let payload;
  try {
    if (!verifyCashfreeWebhookSignature({ signature, timestamp, rawBody })) {
      throw new Error('Signature mismatch');
    }
    payload = JSON.parse(rawBody);
  } catch (_error) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const eventKey =
    req.headers['x-idempotency-key'] ||
    crypto.createHash('sha256').update(`${timestamp}:${rawBody}`).digest('hex');

  res.status(200).send('OK');
  setImmediate(() => {
    processCashfreeWebhook({ payload, eventKey }).catch((error) => {
      console.error('[cashfree] Webhook processing failed', {
        eventType: payload.type,
        message: error.message
      });
    });
  });
  return undefined;
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
