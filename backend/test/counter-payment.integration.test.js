import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/healthiffy_counter_payment_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-with-sufficient-length';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-with-sufficient-length';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CUSTOMER_PAYMENT_MODE = 'PAY_AT_COUNTER';

test('counter checkout creates a pending payment that only the assigned worker can verify', async (t) => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  const [
    { Branch },
    { Category },
    { MenuItem },
    { Order },
    { Payment },
    { User },
    { PAYMENT_STATUS },
    { PAYMENT_METHOD, PAYMENT_PROVIDER },
    { ROLES },
    { createOrder, getWorkerOrders },
    {
      createCashfreeSession,
      getPayments,
      selectCounterPayment,
      submitManualPayment,
      verifyPayment
    }
  ] = await Promise.all([
    import('../src/models/Branch.model.js'),
    import('../src/models/Category.model.js'),
    import('../src/models/MenuItem.model.js'),
    import('../src/models/Order.model.js'),
    import('../src/models/Payment.model.js'),
    import('../src/models/User.model.js'),
    import('../src/constants/order.constants.js'),
    import('../src/constants/payment.constants.js'),
    import('../src/constants/role.constants.js'),
    import('../src/services/order.service.js'),
    import('../src/services/payment.service.js')
  ]);

  t.after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  const [assignedBranch, otherBranch] = await Branch.create([
    {
      name: 'Counter Branch',
      slug: 'counter-branch',
      address: 'Test address one',
      contactNumber: '9999999999',
      openingTime: '09:00',
      closingTime: '22:00'
    },
    {
      name: 'Other Branch',
      slug: 'other-counter-branch',
      address: 'Test address two',
      contactNumber: '9999999998',
      openingTime: '09:00',
      closingTime: '22:00'
    }
  ]);
  const category = await Category.create({ name: 'Counter Meals', slug: 'counter-meals' });
  const menuItem = await MenuItem.create({
    name: 'Counter Meal',
    slug: 'counter-meal',
    description: 'Counter payment test meal',
    price: 180,
    category: category._id,
    branch: assignedBranch._id,
    preparationTime: 15,
    foodType: 'VEG'
  });
  const [customer, assignedWorker, otherWorker, admin] = await User.create([
    {
      name: 'Counter Customer',
      email: 'counter-customer@example.test',
      googleId: 'counter-customer',
      role: ROLES.CUSTOMER
    },
    {
      name: 'Assigned Worker',
      email: 'assigned-counter-worker@example.test',
      googleId: 'assigned-counter-worker',
      role: ROLES.WORKER,
      assignedBranch: assignedBranch._id
    },
    {
      name: 'Other Worker',
      email: 'other-counter-worker@example.test',
      googleId: 'other-counter-worker',
      role: ROLES.WORKER,
      assignedBranch: otherBranch._id
    },
    {
      name: 'Counter Admin',
      email: 'counter-admin@example.test',
      googleId: 'counter-admin',
      role: ROLES.ADMIN
    }
  ]);

  const order = await createOrder(
    {
      branch: assignedBranch._id,
      items: [{ menuItem: menuItem._id, quantity: 2 }],
      specialInstructions: 'No onion'
    },
    customer._id
  );
  const pendingPayment = await Payment.findById(order.payment._id);

  assert.equal(order.paymentStatus, PAYMENT_STATUS.PENDING_VERIFICATION);
  assert.equal(pendingPayment.method, PAYMENT_METHOD.PAY_AT_COUNTER);
  assert.equal(pendingPayment.provider, PAYMENT_PROVIDER.MANUAL);
  assert.equal(pendingPayment.status, PAYMENT_STATUS.PENDING_VERIFICATION);
  assert.equal(pendingPayment.amount, 360);
  assert.equal(pendingPayment.paymentTime, undefined);

  await assert.rejects(
    verifyPayment({ paymentId: pendingPayment._id, user: otherWorker }),
    (error) => error.statusCode === 403
  );

  const assignedQueue = await getWorkerOrders(assignedWorker, {});
  const otherQueue = await getWorkerOrders(otherWorker, {});
  assert.equal(assignedQueue.orders.length, 1);
  assert.equal(otherQueue.orders.length, 0);

  const verifiedPayment = await verifyPayment({
    paymentId: pendingPayment._id,
    user: assignedWorker
  });
  const verifiedOrder = await Order.findById(order._id);

  assert.equal(verifiedPayment.status, PAYMENT_STATUS.VERIFIED);
  assert.equal(verifiedPayment.verifiedBy._id.toString(), assignedWorker._id.toString());
  assert.ok(verifiedPayment.verifiedAt);
  assert.ok(verifiedPayment.paymentTime);
  assert.equal(verifiedOrder.paymentStatus, PAYMENT_STATUS.VERIFIED);

  const adminHistory = await getPayments({}, admin);
  assert.equal(adminHistory.payments.length, 1);
  assert.equal(adminHistory.payments[0].method, PAYMENT_METHOD.PAY_AT_COUNTER);
  assert.equal(adminHistory.payments[0].verifiedBy._id.toString(), assignedWorker._id.toString());

  const legacyOrder = await Order.create({
    orderNumber: 'HF-LEGACY-COUNTER',
    customer: customer._id,
    branch: assignedBranch._id,
    items: [
      {
        menuItem: menuItem._id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        quantity: 1
      }
    ],
    subtotal: menuItem.price,
    totalAmount: menuItem.price
  });
  const legacyPayment = await selectCounterPayment({
    orderId: legacyOrder._id,
    customerId: customer._id
  });
  assert.equal(legacyPayment.method, PAYMENT_METHOD.PAY_AT_COUNTER);
  assert.equal(
    (await Order.findById(legacyOrder._id)).paymentStatus,
    PAYMENT_STATUS.PENDING_VERIFICATION
  );

  await assert.rejects(
    submitManualPayment({ orderId: legacyOrder._id, customerId: customer._id, payload: {} }),
    (error) => error.statusCode === 403
  );
  await assert.rejects(
    createCashfreeSession({ orderId: legacyOrder._id, user: customer }),
    (error) => error.statusCode === 403
  );
});
