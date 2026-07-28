import mongoose from 'mongoose';

const cashfreeWebhookEventSchema = new mongoose.Schema(
  {
    eventKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    cashfreeOrderId: {
      type: String,
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ['RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED'],
      default: 'RECEIVED',
      index: true
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1
    },
    processedAt: Date,
    lastError: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

cashfreeWebhookEventSchema.index({ status: 1, updatedAt: 1 });

export const CashfreeWebhookEvent = mongoose.model(
  'CashfreeWebhookEvent',
  cashfreeWebhookEventSchema
);
