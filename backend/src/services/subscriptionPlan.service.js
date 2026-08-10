import mongoose from 'mongoose';
import { Branch } from '../models/Branch.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { SubscriptionPlan } from '../models/SubscriptionPlan.model.js';
import { AppError } from '../utils/AppError.js';

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const populatePlan = (query) =>
  query
    .populate('menuItem', 'name description image category branch isActive isAvailable')
    .populate('branches', 'name slug address status isActive');

const assertObjectId = (value, field) => {
  if (value && !mongoose.isValidObjectId(value)) {
    throw new AppError(`${field} is invalid`, 400);
  }
};

const assertActiveReferences = async ({ menuItem, branches }) => {
  const [menuItemDoc, branchCount] = await Promise.all([
    MenuItem.findOne({ _id: menuItem, isActive: true }),
    Branch.countDocuments({ _id: { $in: branches }, isActive: true })
  ]);

  if (!menuItemDoc) throw new AppError('An active menu item is required', 400);
  if (branchCount !== branches.length) {
    throw new AppError('Every selected branch must be active', 400);
  }
};

const assertPlanMealCount = ({ durationDays, totalMeals }) => {
  if (totalMeals > durationDays) {
    throw new AppError('Total meals cannot exceed subscription duration', 400);
  }
};

export const createSubscriptionPlan = async (payload, userId) => {
  await assertActiveReferences(payload);
  const plan = await SubscriptionPlan.create({
    ...payload,
    createdBy: userId,
    updatedBy: userId
  });
  return getSubscriptionPlanById(plan._id, { includeInactive: true });
};

export const getSubscriptionPlans = async (query = {}, { includeInactive = false } = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (!includeInactive) filter.isActive = true;
  if (query.branch) {
    assertObjectId(query.branch, 'Branch');
    filter.branches = query.branch;
  }
  if (query.isActive !== undefined && includeInactive) {
    filter.isActive = query.isActive === true || query.isActive === 'true';
  }
  if (query.search) filter.$text = { $search: String(query.search).trim() };

  const [plans, total] = await Promise.all([
    populatePlan(SubscriptionPlan.find(filter).sort('-createdAt').skip(skip).limit(limit)),
    SubscriptionPlan.countDocuments(filter)
  ]);

  const visiblePlans = includeInactive
    ? plans
    : plans
        .filter((plan) => plan.menuItem?.isActive && plan.menuItem?.isAvailable)
        .map((plan) => {
          const data = plan.toObject();
          data.branches = data.branches.filter((branch) => branch.isActive);
          return data;
        })
        .filter((plan) => plan.branches.length > 0);

  return {
    plans: visiblePlans,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

export const getSubscriptionPlanById = async (planId, { includeInactive = false } = {}) => {
  assertObjectId(planId, 'Plan');
  const plan = await populatePlan(
    SubscriptionPlan.findOne({
      _id: planId,
      ...(includeInactive ? {} : { isActive: true })
    })
  );
  if (!plan) throw new AppError('Subscription plan not found', 404);
  return plan;
};

export const updateSubscriptionPlan = async (planId, payload, userId) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new AppError('Subscription plan not found', 404);

  const nextMenuItem = payload.menuItem || plan.menuItem;
  const nextBranches = payload.branches || plan.branches;
  const nextDuration = payload.durationDays ?? plan.durationDays;
  const nextTotalMeals = payload.totalMeals ?? plan.totalMeals;

  await assertActiveReferences({ menuItem: nextMenuItem, branches: nextBranches });
  assertPlanMealCount({ durationDays: nextDuration, totalMeals: nextTotalMeals });

  Object.assign(plan, payload, { updatedBy: userId });
  await plan.save();
  return getSubscriptionPlanById(plan._id, { includeInactive: true });
};

export const deactivateSubscriptionPlan = async (planId, userId) =>
  getSubscriptionPlanById(
    await SubscriptionPlan.findByIdAndUpdate(
      planId,
      { $set: { isActive: false, updatedBy: userId } },
      { new: true, runValidators: true }
    ).then((plan) => {
      if (!plan) throw new AppError('Subscription plan not found', 404);
      return plan._id;
    }),
    { includeInactive: true }
  );
