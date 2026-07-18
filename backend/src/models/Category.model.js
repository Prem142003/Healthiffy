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

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300
    },
    image: imageSchema,
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
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

categorySchema.index({ name: 'text', description: 'text' });

export const Category = mongoose.model('Category', categorySchema);
