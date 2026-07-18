import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  getPaymentSettings,
  getPayments,
  rejectPayment,
  submitManualPayment,
  updatePaymentSettings,
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

export const listPaymentsHandler = catchAsync(async (req, res) => {
  const data = await getPayments(req.query);
  sendSuccess(res, 200, 'Payments fetched', data);
});

export const verifyPaymentHandler = catchAsync(async (req, res) => {
  const payment = await verifyPayment({ paymentId: req.params.id, userId: req.user._id });
  sendSuccess(res, 200, 'Payment verified', { payment });
});

export const rejectPaymentHandler = catchAsync(async (req, res) => {
  const payload = validateRejectPayment(req.body);
  const payment = await rejectPayment({
    paymentId: req.params.id,
    reason: payload.reason,
    userId: req.user._id
  });
  sendSuccess(res, 200, 'Payment rejected', { payment });
});
