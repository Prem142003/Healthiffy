import mongoose from 'mongoose';
import { FOOD_TYPES } from '../constants/menu.constants.js';

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

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 600
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    offerPrice: {
      type: Number,
      min: 0
    },
    image: imageSchema,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    preparationTime: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: 1
    },
    foodType: {
      type: String,
      enum: Object.values(FOOD_TYPES),
      required: true,
      index: true
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 40
      }
    ],
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

menuItemSchema.index({ branch: 1, category: 1, isAvailable: 1, isActive: 1 });
menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
menuItemSchema.index({ slug: 1, branch: 1 }, { unique: true });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
