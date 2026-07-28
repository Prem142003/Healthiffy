import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/healthiffy_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-with-sufficient-length';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-with-sufficient-length';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CASHFREE_ENV = 'sandbox';
process.env.CASHFREE_APP_ID = 'test-app-id';
process.env.CASHFREE_SECRET_KEY = 'test-secret-key';
process.env.CASHFREE_API_VERSION = '2025-01-01';

test('Cashfree webhook signature uses the timestamp and exact raw body', async () => {
  const { verifyCashfreeWebhookSignature } = await import(
    '../src/services/cashfree.service.js'
  );
  const timestamp = '1720000000000';
  const rawBody = Buffer.from('{"amount":170.00}');
  const signature = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
    .update(`${timestamp}${rawBody.toString('utf8')}`)
    .digest('base64');

  assert.equal(
    verifyCashfreeWebhookSignature({ timestamp, rawBody, signature }),
    true
  );
  assert.equal(
    verifyCashfreeWebhookSignature({
      timestamp,
      rawBody: Buffer.from('{"amount":170}'),
      signature
    }),
    false
  );
});

test('Cashfree webhook rejects an unsigned request', async (t) => {
  const { app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  t.after(() => {
    server.close();
  });

  const { port } = server.address();
  const response = await fetch(
    `http://127.0.0.1:${port}/api/v1/payments/webhooks/cashfree`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: {
            order_id: 'unsigned-order'
          }
        }
      })
    }
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Invalid Cashfree webhook signature');
});
