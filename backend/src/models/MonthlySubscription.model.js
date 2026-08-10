import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constants.js';

const planSnapshotSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true
    },
    mealName: {
      type: String,
      required: true
    },
    description: String,
    imageUrl: String
  },
  { _id: false }
);

const monthlySubscriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
      index: true
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPurchase',
      required: true,
      unique: true,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    planSnapshot: {
      type: planSnapshotSchema,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    startDateKey: {
      type: String,
      required: true,
      index: true
    },
    endDateKey: {
      type: String,
      required: true,
      index: true
    },
    totalMeals: {
      type: Number,
      required: true,
      min: 1
    },
    mealsDelivered: {
      type: Number,
      default: 0,
      min: 0
    },
    mealsRemaining: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.REFUNDED],
      default: PAYMENT_STATUS.PAID,
      index: true
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 1
    },
    cashfreeOrderId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    cashfreePaymentId: {
      type: String,
      trim: true,
      index: true
    },
    activatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

monthlySubscriptionSchema.index({ branch: 1, status: 1, endDateKey: 1 });
monthlySubscriptionSchema.index({ customer: 1, createdAt: -1 });

export const MonthlySubscription = mongoose.model(
  'MonthlySubscription',
  monthlySubscriptionSchema
);

