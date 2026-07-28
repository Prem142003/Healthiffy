import mongoose from 'mongoose';

const cashfreeWebhookEventSchema = new mongoose.Schema(
  {
    eventKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    eventType: {
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
      enum: ['RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED'],
      default: 'RECEIVED',
      index: true
    },
    errorMessage: {
      type: String,
      trim: true,
      maxlength: 300
    },
    processedAt: Date
  },
  { timestamps: true }
);

export const CashfreeWebhookEvent = mongoose.model(
  'CashfreeWebhookEvent',
  cashfreeWebhookEventSchema
);
