import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { CASHFREE_ORDER_STATUS } from '../constants/payment.constants.js';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constants.js';
import { MonthlySubscription } from '../models/MonthlySubscription.model.js';
import { SubscriptionPurchase } from '../models/SubscriptionPurchase.model.js';
import { User } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import {
  addDaysToDateKey,
  dateKeyToIndiaStart,
  getIndiaDateKey
} from '../utils/indiaDate.js';
import {
  createHealthiffyCheckoutOrder,
  fetchCashfreeOrder,
  getCashfreePublicSettings
} from './cashfree.service.js';
import { getSubscriptionPlanById } from './subscriptionPlan.service.js';
import { emitSubscriptionActivated } from '../sockets/socket.server.js';

const normalizeIndianPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  const normalized = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(normalized) ? normalized : null;
};

const safeSession = (purchase) => ({
  purchaseId: purchase._id,
  paymentSessionId: purchase.cashfreePaymentSessionId,
  cashfreeOrderId: purchase.cashfreeOrderId,
  environment: getCashfreePublicSettings().environment,
  amount: purchase.amount,
  status: purchase.paymentStatus
});

const purchaseOrderId = (purchaseId) => `HFS_${purchaseId}_${Date.now()}`;

const assertPurchaseAccess = (purchase, user) => {
  const customerId = purchase.customer?._id || purchase.customer;
  if (user.role !== 'ADMIN' && customerId.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to access this purchase', 403);
  }
};

export const createSubscriptionPurchaseSession = async ({
  planId,
  branchId,
  customerPhone,
  customer
}) => {
  const plan = await getSubscriptionPlanById(planId);
  const offeredBranch = plan.branches.find((branch) => branch._id.toString() === branchId);
  if (!offeredBranch?.isActive) {
    throw new AppError('This plan is not available at the selected branch', 400);
  }
  if (!plan.menuItem?.isActive || !plan.menuItem?.isAvailable) {
    throw new AppError('The meal for this plan is currently unavailable', 400);
  }

  const todayKey = getIndiaDateKey();
  const activeSubscription = await MonthlySubscription.exists({
    customer: customer._id,
    plan: plan._id,
    branch: offeredBranch._id,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDateKey: { $lte: todayKey },
    endDateKey: { $gte: todayKey },
    mealsRemaining: { $gt: 0 }
  });
  if (activeSubscription) {
    throw new AppError('You already have an active subscription for this plan and branch', 409);
  }

  const phone = normalizeIndianPhone(customerPhone || customer.phone);
  if (!phone) throw new AppError('A valid 10-digit Indian mobile number is required', 400);

  const existing = await SubscriptionPurchase.findOne({
    customer: customer._id,
    plan: plan._id,
    branch: offeredBranch._id,
    paymentStatus: PAYMENT_STATUS.PROCESSING,
    sessionCreatedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
  })
    .sort('-createdAt')
    .select('+cashfreePaymentSessionId');

  if (existing?.cashfreePaymentSessionId) return safeSession(existing);

  const imageUrl = plan.image?.url || plan.menuItem.image?.url;
  const purchase = await SubscriptionPurchase.create({
    customer: customer._id,
    plan: plan._id,
    branch: offeredBranch._id,
    amount: plan.price,
    durationDays: plan.durationDays,
    totalMeals: plan.totalMeals,
    planSnapshot: {
      planName: plan.name,
      mealName: plan.menuItem.name,
      description: plan.description || plan.menuItem.description,
      imageUrl
    }
  });
  const cashfreeOrderId = purchaseOrderId(purchase._id);

  try {
    const cashfreeOrder = await createHealthiffyCheckoutOrder(
      {
        cashfreeOrderId,
        amount: purchase.amount,
        customer,
        customerPhone: phone,
        note: `Healthiffy monthly plan ${plan.name}`
      },
      `healthiffy-subscription:${purchase._id}`
    );

    if (!cashfreeOrder.payment_session_id) {
      throw new AppError('Cashfree did not return a payment session', 502);
    }

    purchase.cashfreeOrderId = cashfreeOrderId;
    purchase.cashfreePaymentSessionId = cashfreeOrder.payment_session_id;
    purchase.cashfreeStatus = cashfreeOrder.order_status || CASHFREE_ORDER_STATUS.ACTIVE;
    purchase.sessionCreatedAt = new Date();
    purchase.providerSyncedAt = new Date();
    await purchase.save();

    if (customer.phone !== phone) {
      await User.findByIdAndUpdate(customer._id, { $set: { phone } });
    }

    return safeSession(purchase);
  } catch (error) {
    await SubscriptionPurchase.findByIdAndUpdate(purchase._id, {
      $set: {
        cashfreeOrderId,
        paymentStatus: PAYMENT_STATUS.REJECTED,
        failureReason: error.message,
        providerSyncedAt: new Date()
      }
    });
    throw error;
  }
};

export const confirmSubscriptionPurchase = async ({
  purchase,
  cashfreePaymentId,
  confirmedAt = new Date()
}) => {
  const purchaseDoc = await SubscriptionPurchase.findById(purchase._id || purchase);
  if (!purchaseDoc) throw new Error('Subscription purchase was not found');

  purchaseDoc.paymentStatus = PAYMENT_STATUS.PAID;
  purchaseDoc.cashfreeStatus = CASHFREE_ORDER_STATUS.PAID;
  purchaseDoc.cashfreePaymentId = cashfreePaymentId || purchaseDoc.cashfreePaymentId;
  purchaseDoc.paymentTime = confirmedAt;
  purchaseDoc.providerSyncedAt = new Date();
  purchaseDoc.failureCode = undefined;
  purchaseDoc.failureReason = undefined;
  await purchaseDoc.save();

  let subscription = await MonthlySubscription.findOne({ purchase: purchaseDoc._id });
  let firstActivation = false;

  if (!subscription) {
    const startDateKey = getIndiaDateKey(confirmedAt);
    const endDateKey = addDaysToDateKey(startDateKey, purchaseDoc.durationDays - 1);

    try {
      subscription = await MonthlySubscription.create({
        customer: purchaseDoc.customer,
        plan: purchaseDoc.plan,
        purchase: purchaseDoc._id,
        branch: purchaseDoc.branch,
        planSnapshot: purchaseDoc.planSnapshot,
        startDate: dateKeyToIndiaStart(startDateKey),
        endDate: dateKeyToIndiaStart(endDateKey),
        startDateKey,
        endDateKey,
        totalMeals: purchaseDoc.totalMeals,
        mealsDelivered: 0,
        mealsRemaining: purchaseDoc.totalMeals,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        paymentStatus: PAYMENT_STATUS.PAID,
        amountPaid: purchaseDoc.amount,
        cashfreeOrderId: purchaseDoc.cashfreeOrderId,
        cashfreePaymentId: purchaseDoc.cashfreePaymentId,
        activatedAt: confirmedAt
      });
      firstActivation = true;
    } catch (error) {
      if (error?.code !== 11000) throw error;
      subscription = await MonthlySubscription.findOne({ purchase: purchaseDoc._id });
    }
  }

  purchaseDoc.activatedSubscription = subscription._id;
  await purchaseDoc.save();

  if (firstActivation) {
    emitSubscriptionActivated(subscription);
  }

  return { purchase: purchaseDoc, subscription, firstActivation };
};

export const markSubscriptionPurchaseUnsuccessful = async ({ purchase, payload, eventType }) => {
  if (purchase.paymentStatus === PAYMENT_STATUS.PAID) return;
  const providerPayment = payload.data?.payment || {};
  const errorDetails = payload.data?.error_details || {};

  await SubscriptionPurchase.findByIdAndUpdate(purchase._id, {
    $set: {
      paymentStatus: PAYMENT_STATUS.REJECTED,
      cashfreeStatus:
        eventType === 'PAYMENT_USER_DROPPED_WEBHOOK'
          ? 'USER_DROPPED'
          : providerPayment.payment_status || CASHFREE_ORDER_STATUS.FAILED,
      cashfreePaymentId: providerPayment.cf_payment_id?.toString(),
      paymentTime: providerPayment.payment_time
        ? new Date(providerPayment.payment_time)
        : purchase.paymentTime,
      providerSyncedAt: new Date(),
      failureCode: errorDetails.error_code,
      failureReason:
        eventType === 'PAYMENT_USER_DROPPED_WEBHOOK'
          ? 'Payment was not completed'
          : errorDetails.error_reason || 'Cashfree reported an unsuccessful payment'
    }
  });
};

export const syncSubscriptionPurchaseStatus = async ({ purchaseId, user }) => {
  const purchase = await SubscriptionPurchase.findById(purchaseId);
  if (!purchase) throw new AppError('Subscription purchase not found', 404);
  assertPurchaseAccess(purchase, user);

  if (purchase.paymentStatus === PAYMENT_STATUS.PAID && purchase.activatedSubscription) {
    return {
      status: PAYMENT_STATUS.PAID,
      subscriptionId: purchase.activatedSubscription
    };
  }

  if (!purchase.cashfreeOrderId) {
    throw new AppError('Cashfree payment session was not created', 400);
  }

  const cashfreeOrder = await fetchCashfreeOrder(purchase.cashfreeOrderId);
  if (cashfreeOrder.order_status === CASHFREE_ORDER_STATUS.PAID) {
    const result = await confirmSubscriptionPurchase({ purchase });
    return { status: PAYMENT_STATUS.PAID, subscriptionId: result.subscription._id };
  }

  const terminalStatuses = [
    CASHFREE_ORDER_STATUS.FAILED,
    CASHFREE_ORDER_STATUS.EXPIRED,
    CASHFREE_ORDER_STATUS.TERMINATED
  ];
  const paymentStatus = terminalStatuses.includes(cashfreeOrder.order_status)
    ? PAYMENT_STATUS.REJECTED
    : PAYMENT_STATUS.PROCESSING;

  await SubscriptionPurchase.findByIdAndUpdate(purchase._id, {
    $set: {
      paymentStatus,
      cashfreeStatus: cashfreeOrder.order_status || CASHFREE_ORDER_STATUS.ACTIVE,
      providerSyncedAt: new Date()
    }
  });

  return { status: paymentStatus };
};
