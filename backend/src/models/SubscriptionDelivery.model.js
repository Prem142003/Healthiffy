import mongoose from 'mongoose';
import { DELIVERY_STATUS } from '../constants/subscription.constants.js';

const subscriptionDeliverySchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonthlySubscription',
      required: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    deliveryDate: {
      type: Date,
      required: true
    },
    deliveryDateKey: {
      type: String,
      required: true,
      index: true
    },
    deliveryTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.DELIVERED
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300
    }
  },
  { timestamps: true }
);

subscriptionDeliverySchema.index(
  { subscription: 1, deliveryDateKey: 1 },
  { unique: true }
);
subscriptionDeliverySchema.index({ branch: 1, deliveryDateKey: 1 });
subscriptionDeliverySchema.index({ worker: 1, deliveryDateKey: 1 });

export const SubscriptionDelivery = mongoose.model(
  'SubscriptionDelivery',
  subscriptionDeliverySchema
);

