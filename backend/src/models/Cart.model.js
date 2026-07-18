import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
