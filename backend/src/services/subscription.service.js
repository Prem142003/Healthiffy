import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/order.constants.js';
import {
  DELIVERY_STATUS,
  SUBSCRIPTION_STATUS
} from '../constants/subscription.constants.js';
import { MonthlySubscription } from '../models/MonthlySubscription.model.js';
import { SubscriptionDelivery } from '../models/SubscriptionDelivery.model.js';
import { SubscriptionPurchase } from '../models/SubscriptionPurchase.model.js';
import { User } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import {
  dateKeyToIndiaStart,
  getIndiaDateKey,
  getIndiaMonthRange
} from '../utils/indiaDate.js';
import { emitSubscriptionDelivery } from '../sockets/socket.server.js';

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const assertObjectId = (value, field) => {
  if (value && !mongoose.isValidObjectId(value)) {
    throw new AppError(`${field} is invalid`, 400);
  }
};

const assertDateKey = (value) => {
  if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError('Date must use YYYY-MM-DD format', 400);
  }
};

const assignedBranchId = (user) => user.assignedBranch?._id || user.assignedBranch;

const populateSubscription = (query) =>
  query
    .populate('customer', 'name email phone avatar')
    .populate('plan', 'name menuItem price durationDays totalMeals isActive')
    .populate('branch', 'name slug address');

const populateDelivery = (query) =>
  query
    .populate('customer', 'name email phone')
    .populate('branch', 'name slug')
    .populate('worker', 'name email')
    .populate('subscription', 'planSnapshot startDate endDate totalMeals');

export const expireSubscriptions = async (todayKey = getIndiaDateKey()) =>
  MonthlySubscription.updateMany(
    {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      $or: [{ endDateKey: { $lt: todayKey } }, { mealsRemaining: { $lte: 0 } }]
    },
    { $set: { status: SUBSCRIPTION_STATUS.EXPIRED } }
  );

const addTodayDeliveryStatus = async (subscriptions, todayKey) => {
  if (!subscriptions.length) return [];
  const deliveries = await SubscriptionDelivery.find({
    subscription: { $in: subscriptions.map((subscription) => subscription._id) },
    deliveryDateKey: todayKey
  }).select('subscription deliveryTime worker');
  const deliveryBySubscription = new Map(
    deliveries.map((delivery) => [delivery.subscription.toString(), delivery])
  );

  return subscriptions.map((subscription) => ({
    ...subscription.toObject(),
    todayDelivered: deliveryBySubscription.has(subscription._id.toString()),
    todayDelivery: deliveryBySubscription.get(subscription._id.toString()) || null
  }));
};

export const getMySubscriptions = async (customerId) => {
  const todayKey = getIndiaDateKey();
  await expireSubscriptions(todayKey);
  const subscriptions = await populateSubscription(
    MonthlySubscription.find({ customer: customerId }).sort('-createdAt')
  );
  return addTodayDeliveryStatus(subscriptions, todayKey);
};

export const getWorkerSubscriptions = async (query, worker) => {
  const branchId = assignedBranchId(worker);
  if (!branchId) throw new AppError('Worker is not assigned to a branch', 403);

  const todayKey = getIndiaDateKey();
  await expireSubscriptions(todayKey);
  const { page, limit, skip } = getPagination(query);
  const filter = {
    branch: branchId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDateKey: { $lte: todayKey },
    endDateKey: { $gte: todayKey },
    mealsRemaining: { $gt: 0 }
  };
  if (query.search) {
    const customerIds = await User.find({
      name: { $regex: String(query.search).trim(), $options: 'i' }
    }).distinct('_id');
    filter.customer = { $in: customerIds };
  }

  const [subscriptions, total] = await Promise.all([
    populateSubscription(
      MonthlySubscription.find(filter).sort('customer').skip(skip).limit(limit)
    ),
    MonthlySubscription.countDocuments(filter)
  ]);

  return {
    subscriptions: await addTodayDeliveryStatus(subscriptions, todayKey),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    dateKey: todayKey
  };
};

export const getAdminSubscriptions = async (query) => {
  const todayKey = getIndiaDateKey();
  await expireSubscriptions(todayKey);
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.branch) {
    assertObjectId(query.branch, 'Branch');
    filter.branch = query.branch;
  }
  if (query.plan) {
    assertObjectId(query.plan, 'Plan');
    filter.plan = query.plan;
  }
  if (query.status) {
    const status = String(query.status).toUpperCase();
    if (!Object.values(SUBSCRIPTION_STATUS).includes(status)) {
      throw new AppError('Subscription status is invalid', 400);
    }
    filter.status = status;
  }
  if (query.date) {
    assertDateKey(query.date);
    filter.startDateKey = { $lte: query.date };
    filter.endDateKey = { $gte: query.date };
  }

  const [subscriptions, total] = await Promise.all([
    populateSubscription(
      MonthlySubscription.find(filter).sort('-createdAt').skip(skip).limit(limit)
    ),
    MonthlySubscription.countDocuments(filter)
  ]);

  return {
    subscriptions: await addTodayDeliveryStatus(subscriptions, todayKey),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

export const getSubscriptionDeliveryHistory = async ({ query, user, scope }) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (scope === 'customer') filter.customer = user._id;
  if (scope === 'worker') {
    const branchId = assignedBranchId(user);
    if (!branchId) throw new AppError('Worker is not assigned to a branch', 403);
    filter.branch = branchId;
  }
  if (scope === 'admin' && query.branch) {
    assertObjectId(query.branch, 'Branch');
    filter.branch = query.branch;
  }
  if (scope === 'admin' && query.worker) {
    assertObjectId(query.worker, 'Worker');
    filter.worker = query.worker;
  }
  if (query.date) {
    assertDateKey(query.date);
    filter.deliveryDateKey = query.date;
  }

  const [deliveries, total] = await Promise.all([
    populateDelivery(
      SubscriptionDelivery.find(filter).sort('-deliveryTime').skip(skip).limit(limit)
    ),
    SubscriptionDelivery.countDocuments(filter)
  ]);

  return {
    deliveries,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

const explainDeliveryFailure = async (subscriptionId, branchId, todayKey) => {
  const subscription = await MonthlySubscription.findById(subscriptionId);
  if (!subscription) throw new AppError('Subscription not found', 404);
  if (subscription.branch.toString() !== branchId.toString()) {
    throw new AppError('You cannot access another branch subscription', 403);
  }
  if (subscription.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    throw new AppError('Subscription is not active', 400);
  }
  if (todayKey < subscription.startDateKey || todayKey > subscription.endDateKey) {
    throw new AppError('Today is outside the subscription period', 400);
  }
  if (subscription.mealsRemaining <= 0) {
    throw new AppError('No meals remain in this subscription', 400);
  }
  throw new AppError('Unable to record this delivery', 409);
};

export const markTodayDelivered = async ({ subscriptionId, worker, notes }) => {
  assertObjectId(subscriptionId, 'Subscription');
  const branchId = assignedBranchId(worker);
  if (!branchId) throw new AppError('Worker is not assigned to a branch', 403);

  const now = new Date();
  const todayKey = getIndiaDateKey(now);
  await expireSubscriptions(todayKey);

  const session = await mongoose.startSession();
  let updatedSubscription;
  let delivery;

  try {
    await session.withTransaction(async () => {
      updatedSubscription = await MonthlySubscription.findOneAndUpdate(
        {
          _id: subscriptionId,
          branch: branchId,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          startDateKey: { $lte: todayKey },
          endDateKey: { $gte: todayKey },
          mealsRemaining: { $gt: 0 },
          $expr: { $lt: ['$mealsDelivered', '$totalMeals'] }
        },
        [
          {
            $set: {
              mealsDelivered: { $add: ['$mealsDelivered', 1] },
              mealsRemaining: { $subtract: ['$mealsRemaining', 1] },
              status: {
                $cond: [
                  { $eq: ['$mealsRemaining', 1] },
                  SUBSCRIPTION_STATUS.EXPIRED,
                  '$status'
                ]
              }
            }
          }
        ],
        { new: true, session }
      );

      if (!updatedSubscription) {
        await explainDeliveryFailure(subscriptionId, branchId, todayKey);
      }

      const created = await SubscriptionDelivery.create(
        [
          {
            subscription: updatedSubscription._id,
            customer: updatedSubscription.customer,
            branch: branchId,
            worker: worker._id,
            deliveryDate: dateKeyToIndiaStart(todayKey),
            deliveryDateKey: todayKey,
            deliveryTime: now,
            status: DELIVERY_STATUS.DELIVERED,
            notes
          }
        ],
        { session }
      );
      [delivery] = created;
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError("Today's meal has already been marked delivered", 409);
    }
    throw error;
  } finally {
    await session.endSession();
  }

  const [populatedSubscription, populatedDelivery] = await Promise.all([
    populateSubscription(MonthlySubscription.findById(updatedSubscription._id)),
    populateDelivery(SubscriptionDelivery.findById(delivery._id))
  ]);
  emitSubscriptionDelivery({
    subscription: populatedSubscription,
    delivery: populatedDelivery
  });

  return { subscription: populatedSubscription, delivery: populatedDelivery };
};

export const getSubscriptionAnalytics = async () => {
  const todayKey = getIndiaDateKey();
  const month = getIndiaMonthRange();
  await expireSubscriptions(todayKey);

  const activeMatch = {
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDateKey: { $lte: todayKey },
    endDateKey: { $gte: todayKey },
    mealsRemaining: { $gt: 0 }
  };

  const [
    activeSubscribers,
    deliveredToday,
    revenueSummary,
    revenueByBranch,
    activeByBranch,
    deliveredByBranch,
    completedTodayByBranch,
    workerDeliveryCount
  ] = await Promise.all([
    MonthlySubscription.countDocuments(activeMatch),
    SubscriptionDelivery.countDocuments({ deliveryDateKey: todayKey }),
    SubscriptionPurchase.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUS.PAID,
          paymentTime: { $gte: month.start, $lt: month.end }
        }
      },
      { $group: { _id: null, revenue: { $sum: '$amount' }, purchases: { $sum: 1 } } }
    ]),
    SubscriptionPurchase.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUS.PAID,
          paymentTime: { $gte: month.start, $lt: month.end }
        }
      },
      { $group: { _id: '$branch', revenue: { $sum: '$amount' }, purchases: { $sum: 1 } } },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: '$branch' },
      { $project: { branchId: '$_id', branchName: '$branch.name', revenue: 1, purchases: 1 } },
      { $sort: { revenue: -1 } }
    ]),
    MonthlySubscription.aggregate([
      { $match: activeMatch },
      { $group: { _id: '$branch', active: { $sum: 1 } } },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: '$branch' },
      { $project: { branchId: '$_id', branchName: '$branch.name', active: 1 } }
    ]),
    SubscriptionDelivery.aggregate([
      { $match: { deliveryDateKey: todayKey } },
      { $group: { _id: '$branch', delivered: { $sum: 1 } } }
    ]),
    SubscriptionDelivery.aggregate([
      { $match: { deliveryDateKey: todayKey } },
      {
        $lookup: {
          from: 'monthlysubscriptions',
          localField: 'subscription',
          foreignField: '_id',
          as: 'subscriptionData'
        }
      },
      { $unwind: '$subscriptionData' },
      { $match: { 'subscriptionData.status': SUBSCRIPTION_STATUS.EXPIRED } },
      { $group: { _id: '$branch', completedToday: { $sum: 1 } } },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: '$branch' },
      { $project: { branchId: '$_id', branchName: '$branch.name', completedToday: 1 } }
    ]),
    SubscriptionDelivery.aggregate([
      { $match: { deliveryDateKey: todayKey } },
      { $group: { _id: '$worker', deliveries: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'worker' } },
      { $unwind: '$worker' },
      { $project: { workerId: '$_id', workerName: '$worker.name', deliveries: 1 } },
      { $sort: { deliveries: -1 } }
    ])
  ]);

  const deliveredBranchMap = new Map(
    deliveredByBranch.map((item) => [item._id.toString(), item.delivered])
  );
  const branchDeliveryMap = new Map(
    activeByBranch.map((item) => [
      item.branchId.toString(),
      {
        branchId: item.branchId,
        branchName: item.branchName,
        expected: item.active,
        delivered: deliveredBranchMap.get(item.branchId.toString()) || 0
      }
    ])
  );
  completedTodayByBranch.forEach((item) => {
    const key = item.branchId.toString();
    const current = branchDeliveryMap.get(key) || {
      branchId: item.branchId,
      branchName: item.branchName,
      expected: 0,
      delivered: deliveredBranchMap.get(key) || 0
    };
    current.expected += item.completedToday;
    branchDeliveryMap.set(key, current);
  });
  const branchDelivery = [...branchDeliveryMap.values()].map((item) => ({
    ...item,
    pending: Math.max(item.expected - item.delivered, 0)
  }));
  const completedToday = completedTodayByBranch.reduce(
    (total, item) => total + item.completedToday,
    0
  );
  const expectedMeals = activeSubscribers + completedToday;

  return {
    dateKey: todayKey,
    activeSubscribers,
    expectedMeals,
    deliveredMeals: deliveredToday,
    pendingMeals: Math.max(expectedMeals - deliveredToday, 0),
    monthlyRevenue: revenueSummary[0]?.revenue || 0,
    monthlyPurchases: revenueSummary[0]?.purchases || 0,
    revenueByBranch,
    mealsByBranch: branchDelivery,
    workerDeliveryCount
  };
};
