import crypto from 'crypto';
import { env } from '../config/env.config.js';
import { AppError } from '../utils/AppError.js';

const BASE_URLS = Object.freeze({
  sandbox: 'https://sandbox.cashfree.com/pg',
  production: 'https://api.cashfree.com/pg'
});

const assertCashfreeConfigured = () => {
  if (!env.cashfree.isConfigured) {
    throw new AppError('Cashfree payments are not configured', 503);
  }

  if (!BASE_URLS[env.cashfree.environment]) {
    throw new AppError('Cashfree environment must be sandbox or production', 500);
  }

  if (env.cashfree.apiVersion !== '2025-01-01') {
    throw new AppError('Cashfree API version must be 2025-01-01', 500);
  }
};

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (_error) {
    return {};
  }
};

const cashfreeRequest = async (path, { method = 'GET', body, idempotencyKey } = {}) => {
  assertCashfreeConfigured();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URLS[env.cashfree.environment]}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': env.cashfree.apiVersion,
        'x-client-id': env.cashfree.appId,
        'x-client-secret': env.cashfree.secretKey,
        'x-request-id': crypto.randomUUID(),
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
      console.error('[cashfree] API request failed', {
        path,
        status: response.status,
        code: data.code,
        type: data.type
      });

      if (response.status === 401 || response.status === 403) {
        throw new AppError('Cashfree credentials or environment are invalid', 503);
      }

      throw new AppError(data.message || 'Cashfree could not process the payment request', 502);
    }

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error('[cashfree] API connection failed', {
      path,
      name: error.name,
      code: error.code,
      message: error.message
    });

    if (error.name === 'AbortError') {
      throw new AppError('Cashfree request timed out. Please try again.', 504);
    }

    throw new AppError('Cashfree is temporarily unavailable. Please try again.', 503);
  } finally {
    clearTimeout(timeout);
  }
};

export const getCashfreePublicSettings = () => ({
  enabled: env.cashfree.isConfigured,
  environment: env.cashfree.environment
});

export const createCashfreeOrder = (payload, idempotencyKey) =>
  cashfreeRequest('/orders', {
    method: 'POST',
    body: payload,
    idempotencyKey
  });

export const createHealthiffyCheckoutOrder = (
  { cashfreeOrderId, amount, customer, customerPhone, note },
  idempotencyKey
) =>
  createCashfreeOrder(
    {
      order_id: cashfreeOrderId,
      order_amount: Number(Number(amount).toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: customer._id.toString(),
        customer_phone: customerPhone,
        customer_email: customer.email,
        customer_name: customer.name
      },
      order_meta: {
        payment_methods: 'upi,cc,dc',
        ...(env.cashfree.webhookUrl ? { notify_url: env.cashfree.webhookUrl } : {})
      },
      payment_methods_filters: {
        methods: {
          action: 'ALLOW',
          values: ['upi', 'credit_card', 'debit_card', 'prepaid_card']
        }
      },
      order_note: note
    },
    idempotencyKey
  );

export const fetchCashfreeOrder = (cashfreeOrderId) =>
  cashfreeRequest(`/orders/${encodeURIComponent(cashfreeOrderId)}`);

export const verifyCashfreeWebhookSignature = ({ timestamp, rawBody, signature }) => {
  assertCashfreeConfigured();

  if (!timestamp || !signature || !Buffer.isBuffer(rawBody)) return false;

  const expected = crypto
    .createHmac('sha256', env.cashfree.secretKey)
    .update(`${timestamp}${rawBody.toString('utf8')}`)
    .digest('base64');

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
};
