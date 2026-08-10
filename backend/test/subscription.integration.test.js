import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/healthiffy_subscription_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-with-sufficient-length';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-with-sufficient-length';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CASHFREE_ENV = 'sandbox';
process.env.CASHFREE_APP_ID = 'test-app-id';
process.env.CASHFREE_SECRET_KEY = 'test-secret-key';
process.env.CASHFREE_API_VERSION = '2025-01-01';

test('subscription payment activation, branch delivery, idempotency, and expiration', async (t) => {
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());

  const [
    { Branch },
    { Category },
    { MenuItem },
    { MonthlySubscription },
    { SubscriptionDelivery },
    { SubscriptionPlan },
    { SubscriptionPurchase },
    { User },
    { PAYMENT_STATUS },
    { ROLES },
    { processCashfreeWebhook, registerCashfreeWebhook },
    {
      expireSubscriptions,
      getAdminSubscriptions,
      getMySubscriptions,
      getSubscriptionDeliveryHistory,
      getWorkerSubscriptions,
      markTodayDelivered
    },
    { createSubscriptionPurchaseSession, syncSubscriptionPurchaseStatus },
    { addDaysToDateKey, dateKeyToIndiaStart, getIndiaDateKey }
  ] = await Promise.all([
    import('../src/models/Branch.model.js'),
    import('../src/models/Category.model.js'),
    import('../src/models/MenuItem.model.js'),
    import('../src/models/MonthlySubscription.model.js'),
    import('../src/models/SubscriptionDelivery.model.js'),
    import('../src/models/SubscriptionPlan.model.js'),
    import('../src/models/SubscriptionPurchase.model.js'),
    import('../src/models/User.model.js'),
    import('../src/constants/order.constants.js'),
    import('../src/constants/role.constants.js'),
    import('../src/services/cashfreeWebhook.service.js'),
    import('../src/services/subscription.service.js'),
    import('../src/services/subscriptionPurchase.service.js'),
    import('../src/utils/indiaDate.js')
  ]);

  t.after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  const [assignedBranch, otherBranch] = await Branch.create([
    { name: 'Kothrud', slug: 'kothrud', address: 'Pune', contactNumber: '9999999999', openingTime: '09:00', closingTime: '22:00' },
    { name: 'FC Road', slug: 'fc-road', address: 'Pune', contactNumber: '9999999998', openingTime: '09:00', closingTime: '22:00' }
  ]);
  const category = await Category.create({ name: 'Meals', slug: 'meals' });
  const menuItem = await MenuItem.create({
    name: 'Veg Thali',
    slug: 'veg-thali',
    description: 'Healthy daily meal',
    price: 150,
    category: category._id,
    branch: assignedBranch._id,
    preparationTime: 20,
    foodType: 'VEG'
  });
  const plan = await SubscriptionPlan.create({
    name: 'Monthly Healthy Lunch',
    menuItem: menuItem._id,
    branches: [assignedBranch._id],
    description: 'Daily lunch',
    price: 3000,
    durationDays: 30,
    totalMeals: 30
  });
  const [customer, otherCustomer, worker, otherWorker] = await User.create([
    { name: 'Customer One', email: 'customer-one@test.dev', googleId: 'customer-one', role: ROLES.CUSTOMER },
    { name: 'Customer Two', email: 'customer-two@test.dev', googleId: 'customer-two', role: ROLES.CUSTOMER },
    { name: 'Worker One', email: 'worker-one@test.dev', googleId: 'worker-one', role: ROLES.WORKER, assignedBranch: assignedBranch._id },
    { name: 'Worker Two', email: 'worker-two@test.dev', googleId: 'worker-two', role: ROLES.WORKER, assignedBranch: otherBranch._id }
  ]);

  const purchase = await SubscriptionPurchase.create({
    customer: customer._id,
    plan: plan._id,
    branch: assignedBranch._id,
    amount: plan.price,
    durationDays: plan.durationDays,
    totalMeals: plan.totalMeals,
    planSnapshot: { planName: plan.name, mealName: menuItem.name, description: plan.description },
    paymentStatus: PAYMENT_STATUS.PROCESSING,
    cashfreeOrderId: `HFS_${new mongoose.Types.ObjectId()}_${Date.now()}`,
    cashfreeStatus: 'ACTIVE'
  });

  const originalFetch = global.fetch;
  global.fetch = async (_url, options = {}) =>
    new Response(
      JSON.stringify(
        options.method === 'POST'
          ? { order_status: 'ACTIVE', payment_session_id: 'subscription-session-test' }
          : { order_status: 'PAID' }
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  t.after(() => { global.fetch = originalFetch; });

  const payload = {
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: { order_id: purchase.cashfreeOrderId },
      payment: {
        cf_payment_id: 'subscription-payment-1',
        payment_status: 'SUCCESS',
        payment_time: new Date().toISOString()
      }
    }
  };
  const receipt = await registerCashfreeWebhook({
    eventKey: 'subscription-event-1',
    type: payload.type,
    cashfreeOrderId: purchase.cashfreeOrderId
  });
  await processCashfreeWebhook({ eventId: receipt.event._id, payload });
  const duplicateReceipt = await registerCashfreeWebhook({
    eventKey: 'subscription-event-1',
    type: payload.type,
    cashfreeOrderId: purchase.cashfreeOrderId
  });

  const activated = await MonthlySubscription.find({ purchase: purchase._id });
  const paidPurchase = await SubscriptionPurchase.findById(purchase._id);
  assert.equal(duplicateReceipt.duplicate, true);
  assert.equal(activated.length, 1);
  assert.equal(activated[0].status, 'ACTIVE');
  assert.equal(activated[0].mealsDelivered, 0);
  assert.equal(activated[0].mealsRemaining, 30);
  assert.equal(paidPurchase.paymentStatus, PAYMENT_STATUS.PAID);
  assert.equal(paidPurchase.activatedSubscription.toString(), activated[0]._id.toString());

  await assert.rejects(
    syncSubscriptionPurchaseStatus({ purchaseId: purchase._id, user: otherCustomer }),
    (error) => error.statusCode === 403
  );

  const assignedView = await getWorkerSubscriptions({ limit: 100 }, worker);
  const otherView = await getWorkerSubscriptions({ limit: 100 }, otherWorker);
  assert.equal(assignedView.subscriptions.length, 1);
  assert.equal(otherView.subscriptions.length, 0);

  await SubscriptionDelivery.init();
  const deliveryAttempts = await Promise.allSettled([
    markTodayDelivered({ subscriptionId: activated[0]._id, worker }),
    markTodayDelivered({ subscriptionId: activated[0]._id, worker })
  ]);
  assert.equal(deliveryAttempts.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(deliveryAttempts.filter((result) => result.status === 'rejected').length, 1);

  const deliveredSubscription = await MonthlySubscription.findById(activated[0]._id);
  const deliveryCount = await SubscriptionDelivery.countDocuments({ subscription: activated[0]._id });
  assert.equal(deliveredSubscription.mealsDelivered, 1);
  assert.equal(deliveredSubscription.mealsRemaining, 29);
  assert.equal(deliveryCount, 1);

  await assert.rejects(
    markTodayDelivered({ subscriptionId: activated[0]._id, worker: otherWorker }),
    (error) => error.statusCode === 403
  );

  const mySubscriptions = await getMySubscriptions(customer._id);
  const customerHistory = await getSubscriptionDeliveryHistory({ query: {}, user: customer, scope: 'customer' });
  const adminView = await getAdminSubscriptions({ branch: assignedBranch._id.toString(), status: 'ACTIVE' });
  assert.equal(mySubscriptions[0].todayDelivered, true);
  assert.equal(customerHistory.deliveries.length, 1);
  assert.equal(customerHistory.deliveries[0].worker.name, worker.name);
  assert.equal(adminView.subscriptions.length, 1);

  const failedSession = await createSubscriptionPurchaseSession({
    planId: plan._id,
    branchId: assignedBranch._id.toString(),
    customerPhone: '9876543210',
    customer: otherCustomer
  });
  assert.equal(failedSession.paymentSessionId, 'subscription-session-test');
  const failedPurchase = await SubscriptionPurchase.findById(failedSession.purchaseId);
  const failedPayload = {
    type: 'PAYMENT_FAILED_WEBHOOK',
    data: {
      order: { order_id: failedPurchase.cashfreeOrderId },
      payment: { cf_payment_id: 'subscription-payment-failed', payment_status: 'FAILED' },
      error_details: { error_code: 'TEST_FAILURE', error_reason: 'Sandbox failure' }
    }
  };
  const failedReceipt = await registerCashfreeWebhook({
    eventKey: 'subscription-event-failed',
    type: failedPayload.type,
    cashfreeOrderId: failedPurchase.cashfreeOrderId
  });
  await processCashfreeWebhook({ eventId: failedReceipt.event._id, payload: failedPayload });
  assert.equal(
    (await SubscriptionPurchase.findById(failedPurchase._id)).paymentStatus,
    PAYMENT_STATUS.REJECTED
  );
  assert.equal(
    await MonthlySubscription.countDocuments({ purchase: failedPurchase._id }),
    0
  );

  const todayKey = getIndiaDateKey();
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const expiredPurchase = await SubscriptionPurchase.create({
    customer: otherCustomer._id,
    plan: plan._id,
    branch: assignedBranch._id,
    amount: plan.price,
    durationDays: 1,
    totalMeals: 1,
    planSnapshot: { planName: plan.name, mealName: menuItem.name },
    paymentStatus: PAYMENT_STATUS.PAID,
    cashfreeOrderId: `HFS_EXPIRED_${Date.now()}`
  });
  const expiredSubscription = await MonthlySubscription.create({
    customer: otherCustomer._id,
    plan: plan._id,
    purchase: expiredPurchase._id,
    branch: assignedBranch._id,
    planSnapshot: { planName: plan.name, mealName: menuItem.name },
    startDate: dateKeyToIndiaStart(yesterdayKey),
    endDate: dateKeyToIndiaStart(yesterdayKey),
    startDateKey: yesterdayKey,
    endDateKey: yesterdayKey,
    totalMeals: 1,
    mealsRemaining: 1,
    amountPaid: plan.price,
    cashfreeOrderId: expiredPurchase.cashfreeOrderId
  });
  await expireSubscriptions(todayKey);
  assert.equal((await MonthlySubscription.findById(expiredSubscription._id)).status, 'EXPIRED');
});
