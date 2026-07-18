import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { PAYMENT_METHOD, PAYMENT_PROVIDER } from '../constants/payment.constants.js';

const imageSchema = new mongoose.Schema(
  {
    publicId: String,
    url: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
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
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.UPI_MANUAL
    },
    provider: {
      type: String,
      enum: Object.values(PAYMENT_PROVIDER),
      default: PAYMENT_PROVIDER.MANUAL
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    upiIdSnapshot: String,
    qrCodeSnapshot: imageSchema,
    transactionReference: {
      type: String,
      trim: true,
      maxlength: 120
    },
    customerNote: {
      type: String,
      trim: true,
      maxlength: 300
    },
    screenshot: imageSchema,
    status: {
      type: String,
      enum: [
        PAYMENT_STATUS.PENDING_VERIFICATION,
        PAYMENT_STATUS.PAID,
        PAYMENT_STATUS.REJECTED
      ],
      default: PAYMENT_STATUS.PENDING_VERIFICATION,
      index: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300
    }
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
