import validator from 'validator';
import { AppError } from '../utils/AppError.js';

const optionalString = (value, field, max = 300) => {
  if (!value) return undefined;
  if (typeof value !== 'string') throw new AppError(`${field} must be text`, 400);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new AppError(`${field} must be ${max} characters or fewer`, 400);
  return trimmed;
};

const optionalUrl = (value, field) => {
  const normalized = optionalString(value, field, 1000);
  if (normalized && !validator.isURL(normalized, { require_protocol: true })) {
    throw new AppError(`${field} must be a valid URL`, 400);
  }
  return normalized;
};

export const validatePaymentSettings = (body) => ({
  upiId: optionalString(body.upiId, 'UPI ID', 120),
  qrCode: body.qrCodeUrl
    ? {
        url: optionalUrl(body.qrCodeUrl, 'QR code URL'),
        publicId: optionalString(body.qrCodePublicId, 'QR code public ID', 200)
      }
    : undefined,
  isEnabled: typeof body.isEnabled === 'boolean' ? body.isEnabled : undefined
});

export const validateManualPayment = (body) => ({
  transactionReference: optionalString(body.transactionReference, 'Transaction reference', 120),
  customerNote: optionalString(body.customerNote, 'Customer note', 300),
  screenshot: body.screenshotUrl
    ? {
        url: optionalUrl(body.screenshotUrl, 'Screenshot URL'),
        publicId: optionalString(body.screenshotPublicId, 'Screenshot public ID', 200)
      }
    : undefined
});

export const validateRejectPayment = (body) => ({
  reason: optionalString(body.reason, 'Rejection reason', 300) || 'Payment could not be verified'
});
