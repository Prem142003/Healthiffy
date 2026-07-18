import mongoose from 'mongoose';
import { BRANCH_STATUS } from '../constants/branch.constants.js';

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

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    image: imageSchema,
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: 500
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      maxlength: 20
    },
    openingTime: {
      type: String,
      required: [true, 'Opening time is required'],
      trim: true
    },
    closingTime: {
      type: String,
      required: [true, 'Closing time is required'],
      trim: true
    },
    googleMapLink: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(BRANCH_STATUS),
      default: BRANCH_STATUS.OPEN,
      index: true
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

branchSchema.index({ name: 'text', address: 'text' });

export const Branch = mongoose.model('Branch', branchSchema);
