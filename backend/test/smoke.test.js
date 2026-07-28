import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCashfreeWebhookSignature } from '../src/config/cashfree.config.js';
import { createSlug } from '../src/helpers/slug.helper.js';
import { generateOrderNumber } from '../src/helpers/orderNumber.helper.js';
import { normalizeCashfreePhone } from '../src/services/payment.service.js';

test('createSlug normalizes names', () => {
  assert.equal(createSlug('FC Road Branch!'), 'fc-road-branch');
});

test('generateOrderNumber creates Healthiffy order numbers', () => {
  assert.match(generateOrderNumber(), /^HF-\d{8}-[A-Z0-9]{6}$/);
});

test('normalizeCashfreePhone accepts local and +91 mobile numbers', () => {
  assert.equal(normalizeCashfreePhone('98765 43210'), '9876543210');
  assert.equal(normalizeCashfreePhone('+91 98765 43210'), '9876543210');
});

test('normalizeCashfreePhone rejects invalid mobile numbers', () => {
  assert.throws(
    () => normalizeCashfreePhone('12345'),
    /valid 10-digit Indian mobile number/
  );
});

test('Cashfree webhook verification accepts only the matching raw payload', () => {
  const timestamp = '1700000000000';
  const rawBody = '{"type":"PAYMENT_SUCCESS_WEBHOOK"}';
  const signature = buildCashfreeWebhookSignature({
    timestamp,
    rawBody,
    secretKey: 'test-secret'
  });
  const tamperedSignature = buildCashfreeWebhookSignature({
    timestamp,
    rawBody: `${rawBody} `,
    secretKey: 'test-secret'
  });

  assert.notEqual(signature, tamperedSignature);
});
