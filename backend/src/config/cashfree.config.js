import crypto from 'node:crypto';
import { env } from './env.config.js';
import { AppError } from '../utils/AppError.js';

const isConfigured = Boolean(env.cashfree.appId && env.cashfree.secretKey);
const isProduction = env.cashfree.environment === 'production';
const baseUrl = isProduction
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const assertConfigured = () => {
  if (!isConfigured) {
    throw new AppError('Cashfree Payments is not configured', 503);
  }
};

const cashfreeRequest = async (path, { method = 'GET', body } = {}) => {
  assertConfigured();

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': env.cashfree.apiVersion,
      'x-client-id': env.cashfree.appId,
      'x-client-secret': env.cashfree.secretKey,
      'x-request-id': crypto.randomUUID()
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000)
  });

  const rawResponse = await response.text();
  let data;
  try {
    data = rawResponse ? JSON.parse(rawResponse) : {};
  } catch (_error) {
    data = { message: 'Cashfree returned an invalid response' };
  }

  if (!response.ok) {
    const error = new Error(data.message || data.type || 'Cashfree request failed');
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
};

export const createCashfreeOrder = (request) =>
  cashfreeRequest('/orders', { method: 'POST', body: request });

export const fetchCashfreeOrder = (cashfreeOrderId) =>
  cashfreeRequest(`/orders/${encodeURIComponent(cashfreeOrderId)}`);

export const buildCashfreeWebhookSignature = ({ timestamp, rawBody, secretKey }) =>
  crypto
    .createHmac('sha256', secretKey)
    .update(`${timestamp}${rawBody}`)
    .digest('base64');

export const verifyCashfreeWebhookSignature = ({ signature, timestamp, rawBody }) => {
  assertConfigured();
  const expected = buildCashfreeWebhookSignature({
    timestamp,
    rawBody,
    secretKey: env.cashfree.secretKey
  });
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(String(signature));

  return (
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  );
};

export const cashfreePublicConfig = Object.freeze({
  enabled: isConfigured,
  mode: isProduction ? 'production' : 'sandbox'
});
