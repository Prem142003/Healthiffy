import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/order.constants.js';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    nameSnapshot: {
      type: String,
      required: true
    },
    priceSnapshot: {
      type: Number,
      required: true
    },
    offerPriceSnapshot: Number,
    imageSnapshot: String,
    preparationTimeSnapshot: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
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
    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, 'Order must contain at least one item']
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: 500
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
      index: true
    },
    placedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

orderSchema.index({ branch: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
