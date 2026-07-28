import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { io as createSocketClient } from 'socket.io-client';

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

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const waitForConnection = (socket) =>
  new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });

test('confirmed payments credit once and notify only authorized socket rooms', async (t) => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  const [
    { Branch },
    { CashfreeWebhookEvent },
    { Order },
    { Payment },
    { User },
    { PAYMENT_STATUS },
    { PAYMENT_METHOD, PAYMENT_PROVIDER },
    { ROLES },
    { confirmPayment },
    { processCashfreeWebhook, registerCashfreeWebhook },
    { initializeSocket },
    { signAccessToken }
  ] = await Promise.all([
    import('../src/models/Branch.model.js'),
    import('../src/models/CashfreeWebhookEvent.model.js'),
    import('../src/models/Order.model.js'),
    import('../src/models/Payment.model.js'),
    import('../src/models/User.model.js'),
    import('../src/constants/order.constants.js'),
    import('../src/constants/payment.constants.js'),
    import('../src/constants/role.constants.js'),
    import('../src/services/paymentConfirmation.service.js'),
    import('../src/services/cashfreeWebhook.service.js'),
    import('../src/sockets/socket.config.js'),
    import('../src/services/token.service.js')
  ]);

  const [assignedBranch, otherBranch] = await Branch.create([
    {
      name: 'Assigned Branch',
      slug: 'assigned-branch',
      address: 'Test address one',
      contactNumber: '9999999999',
      openingTime: '09:00',
      closingTime: '22:00'
    },
    {
      name: 'Other Branch',
      slug: 'other-branch',
      address: 'Test address two',
      contactNumber: '8888888888',
      openingTime: '09:00',
      closingTime: '22:00'
    }
  ]);

  const [customer, admin, assignedWorker, otherWorker] = await User.create([
    {
      name: 'Customer',
      email: 'customer@example.test',
      googleId: 'google-customer',
      role: ROLES.CUSTOMER
    },
    {
      name: 'Admin',
      email: 'admin@example.test',
      googleId: 'google-admin',
      role: ROLES.ADMIN
    },
    {
      name: 'Assigned Worker',
      email: 'worker-one@example.test',
      googleId: 'google-worker-one',
      role: ROLES.WORKER,
      assignedBranch: assignedBranch._id
    },
    {
      name: 'Other Worker',
      email: 'worker-two@example.test',
      googleId: 'google-worker-two',
      role: ROLES.WORKER,
      assignedBranch: otherBranch._id
    }
  ]);

  const order = await Order.create({
    orderNumber: 'HF-TEST-PAYMENT',
    customer: customer._id,
    branch: assignedBranch._id,
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        nameSnapshot: 'Test Item',
        priceSnapshot: 250,
        quantity: 1
      }
    ],
    subtotal: 250,
    totalAmount: 250
  });

  const payment = await Payment.create({
    order: order._id,
    customer: customer._id,
    branch: assignedBranch._id,
    method: PAYMENT_METHOD.CASHFREE_CHECKOUT,
    provider: PAYMENT_PROVIDER.CASHFREE,
    amount: 250,
    status: PAYMENT_STATUS.PROCESSING,
    cashfreeOrderId: `HF_${order._id}_${Date.now()}`
  });
  await Order.findByIdAndUpdate(order._id, { payment: payment._id });

  const httpServer = http.createServer();
  const io = initializeSocket(httpServer);
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const { port } = httpServer.address();
  const socketUrl = `http://127.0.0.1:${port}`;

  const users = [customer, admin, assignedWorker, otherWorker];
  const clients = users.map((user) =>
    createSocketClient(socketUrl, {
      auth: { token: signAccessToken(user) },
      transports: ['websocket'],
      forceNew: true
    })
  );

  t.after(async () => {
    clients.forEach((client) => client.disconnect());
    await new Promise((resolve) => io.close(resolve));
    await mongoose.disconnect();
    await mongo.stop();
  });

  await Promise.all(clients.map(waitForConnection));

  const received = [0, 0, 0, 0];
  clients.forEach((client, index) => {
    client.on('payment:confirmed', () => {
      received[index] += 1;
    });
  });

  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response(JSON.stringify({ order_status: 'PAID' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  t.after(() => {
    global.fetch = originalFetch;
  });

  const webhookPayload = {
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: {
        order_id: payment.cashfreeOrderId
      },
      payment: {
        cf_payment_id: 'cashfree-payment-test',
        payment_status: 'SUCCESS',
        payment_time: new Date().toISOString()
      }
    }
  };
  const firstReceipt = await registerCashfreeWebhook({
    eventKey: 'cashfree-event-test',
    type: webhookPayload.type,
    cashfreeOrderId: payment.cashfreeOrderId
  });
  await processCashfreeWebhook({
    eventId: firstReceipt.event._id,
    payload: webhookPayload
  });
  const duplicateReceipt = await registerCashfreeWebhook({
    eventKey: 'cashfree-event-test',
    type: webhookPayload.type,
    cashfreeOrderId: payment.cashfreeOrderId
  });

  const secondResult = await confirmPayment({
    paymentId: payment._id,
    paymentStatus: PAYMENT_STATUS.PAID,
    cashfreeStatus: 'PAID'
  });
  await wait(300);

  const updatedCustomer = await User.findById(customer._id).select(
    '+paymentSummary.creditedPayments'
  );
  const updatedOrder = await Order.findById(order._id);
  const webhookEvents = await CashfreeWebhookEvent.find({
    eventKey: 'cashfree-event-test'
  });

  assert.equal(firstReceipt.duplicate, false);
  assert.equal(duplicateReceipt.duplicate, true);
  assert.equal(secondResult.firstConfirmation, false);
  assert.equal(webhookEvents.length, 1);
  assert.equal(webhookEvents[0].status, 'PROCESSED');
  assert.equal(updatedCustomer.paymentSummary.successfulPaymentCount, 1);
  assert.equal(updatedCustomer.paymentSummary.totalPaidAmount, 250);
  assert.equal(updatedCustomer.paymentSummary.creditedPayments.length, 1);
  assert.equal(updatedCustomer.paymentSummary.lastPaidOrder.toString(), order._id.toString());
  assert.equal(updatedOrder.paymentStatus, PAYMENT_STATUS.PAID);
  assert.deepEqual(received, [1, 1, 1, 0]);
});
