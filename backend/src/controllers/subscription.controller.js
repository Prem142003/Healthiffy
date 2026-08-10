import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  createSubscriptionPlan,
  deactivateSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan
} from '../services/subscriptionPlan.service.js';
import {
  createSubscriptionPurchaseSession,
  syncSubscriptionPurchaseStatus
} from '../services/subscriptionPurchase.service.js';
import {
  getAdminSubscriptions,
  getMySubscriptions,
  getSubscriptionAnalytics,
  getSubscriptionDeliveryHistory,
  getWorkerSubscriptions,
  markTodayDelivered
} from '../services/subscription.service.js';
import {
  validateCreateSubscriptionPlan,
  validateDelivery,
  validateSubscriptionPurchase,
  validateUpdateSubscriptionPlan
} from '../validators/subscription.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listPublicPlans = catchAsync(async (req, res) => {
  const data = await getSubscriptionPlans(req.query);
  sendSuccess(res, 200, 'Monthly meal plans fetched', data);
});

export const listAdminPlans = catchAsync(async (req, res) => {
  const data = await getSubscriptionPlans(req.query, { includeInactive: true });
  sendSuccess(res, 200, 'Monthly meal plans fetched', data);
});

export const createPlanHandler = catchAsync(async (req, res) => {
  const payload = validateCreateSubscriptionPlan(req.body);
  const plan = await createSubscriptionPlan(payload, req.user._id);
  sendSuccess(res, 201, 'Monthly meal plan created', { plan });
});

export const updatePlanHandler = catchAsync(async (req, res) => {
  const payload = validateUpdateSubscriptionPlan(req.body);
  const plan = await updateSubscriptionPlan(req.params.id, payload, req.user._id);
  sendSuccess(res, 200, 'Monthly meal plan updated', { plan });
});

export const deactivatePlanHandler = catchAsync(async (req, res) => {
  const plan = await deactivateSubscriptionPlan(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Monthly meal plan deactivated', { plan });
});

export const createPurchaseHandler = catchAsync(async (req, res) => {
  const payload = validateSubscriptionPurchase(req.body);
  const session = await createSubscriptionPurchaseSession({
    ...payload,
    customer: req.user
  });
  sendSuccess(res, 201, 'Subscription payment session created', session);
});

export const getPurchaseStatusHandler = catchAsync(async (req, res) => {
  const result = await syncSubscriptionPurchaseStatus({
    purchaseId: req.params.purchaseId,
    user: req.user
  });
  sendSuccess(res, 200, 'Subscription payment status fetched', result);
});

export const getMySubscriptionsHandler = catchAsync(async (req, res) => {
  const subscriptions = await getMySubscriptions(req.user._id);
  sendSuccess(res, 200, 'Your monthly subscriptions fetched', { subscriptions });
});

export const getMyDeliveryHistoryHandler = catchAsync(async (req, res) => {
  const data = await getSubscriptionDeliveryHistory({
    query: req.query,
    user: req.user,
    scope: 'customer'
  });
  sendSuccess(res, 200, 'Your subscription delivery history fetched', data);
});

export const getWorkerCustomersHandler = catchAsync(async (req, res) => {
  const data = await getWorkerSubscriptions(req.query, req.user);
  sendSuccess(res, 200, 'Branch monthly customers fetched', data);
});

export const markTodayDeliveredHandler = catchAsync(async (req, res) => {
  const payload = validateDelivery(req.body);
  const result = await markTodayDelivered({
    subscriptionId: req.params.id,
    worker: req.user,
    notes: payload.notes
  });
  sendSuccess(res, 201, "Today's meal marked delivered", result);
});

export const getWorkerDeliveryHistoryHandler = catchAsync(async (req, res) => {
  const data = await getSubscriptionDeliveryHistory({
    query: req.query,
    user: req.user,
    scope: 'worker'
  });
  sendSuccess(res, 200, 'Branch subscription delivery history fetched', data);
});

export const getAdminCustomersHandler = catchAsync(async (req, res) => {
  const data = await getAdminSubscriptions(req.query);
  sendSuccess(res, 200, 'Monthly customers fetched', data);
});

export const getAdminDeliveryHistoryHandler = catchAsync(async (req, res) => {
  const data = await getSubscriptionDeliveryHistory({
    query: req.query,
    user: req.user,
    scope: 'admin'
  });
  sendSuccess(res, 200, 'Subscription delivery history fetched', data);
});

export const getAdminAnalyticsHandler = catchAsync(async (_req, res) => {
  const analytics = await getSubscriptionAnalytics();
  sendSuccess(res, 200, 'Subscription analytics fetched', { analytics });
});

