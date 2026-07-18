import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema(
  {
    publicId: String,
    url: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const paymentSettingSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      trim: true
    },
    qrCode: qrCodeSchema,
    isEnabled: {
      type: Boolean,
      default: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export const PaymentSetting = mongoose.model('PaymentSetting', paymentSettingSchema);
