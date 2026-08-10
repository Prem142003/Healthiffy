import mongoose from 'mongoose';

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

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      index: true
    },
    branches: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Branch'
        }
      ],
      validate: [(branches) => branches.length > 0, 'At least one branch is required']
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800
    },
    image: imageSchema,
    price: {
      type: Number,
      required: true,
      min: 1
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 366
    },
    totalMeals: {
      type: Number,
      required: true,
      min: 1,
      max: 366
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

subscriptionPlanSchema.index({ isActive: 1, branches: 1 });
subscriptionPlanSchema.index({ name: 'text', description: 'text' });

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

