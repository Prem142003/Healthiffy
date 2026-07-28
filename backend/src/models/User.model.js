import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import validator from 'validator';
import { ROLES } from '../constants/role.constants.js';

const paymentSummarySchema = new mongoose.Schema(
  {
    successfulPaymentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPaidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastPaymentAt: Date,
    lastPaidOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    creditedPayments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Payment'
        }
      ],
      default: [],
      select: false
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Email is invalid']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20
    },
    avatar: {
      type: String,
      trim: true
    },
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true
    },
    password: {
      type: String,
      required() {
        return !this.googleId;
      },
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      index: true
    },
    assignedBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required() {
        return this.role === ROLES.WORKER;
      },
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    paymentSummary: {
      type: paymentSummarySchema,
      default: () => ({})
    },
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  if (user.paymentSummary) delete user.paymentSummary.creditedPayments;
  return user;
};

export const User = mongoose.model('User', userSchema);
