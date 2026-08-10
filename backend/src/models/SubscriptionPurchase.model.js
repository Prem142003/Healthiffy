import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/order.constants.js';

const subscriptionPurchaseSchema = new mongoose.Schema(
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
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1
    },
    totalMeals: {
      type: Number,
      required: true,
      min: 1
    },
    planSnapshot: {
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
    paymentStatus: {
      type: String,
      enum: [PAYMENT_STATUS.PROCESSING, PAYMENT_STATUS.PAID, PAYMENT_STATUS.REJECTED],
      default: PAYMENT_STATUS.PROCESSING,
      index: true
    },
    cashfreeOrderId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true
    },
    cashfreePaymentSessionId: {
      type: String,
      trim: true,
      select: false
    },
    cashfreePaymentId: {
      type: String,
      trim: true,
      index: true
    },
    cashfreeStatus: {
      type: String,
      trim: true,
      maxlength: 50
    },
    paymentTime: Date,
    sessionCreatedAt: Date,
    providerSyncedAt: Date,
    activatedSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonthlySubscription',
      unique: true,
      sparse: true
    },
    failureCode: {
      type: String,
      trim: true,
      maxlength: 120
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  { timestamps: true }
);

subscriptionPurchaseSchema.index({ customer: 1, createdAt: -1 });
subscriptionPurchaseSchema.index({ paymentStatus: 1, createdAt: -1 });

export const SubscriptionPurchase = mongoose.model(
  'SubscriptionPurchase',
  subscriptionPurchaseSchema
);
