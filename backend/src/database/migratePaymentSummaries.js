import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/order.constants.js';
import { connectDB } from './connectDB.js';
import { Payment } from '../models/Payment.model.js';
import { User } from '../models/User.model.js';

const migratePaymentSummaries = async () => {
  await connectDB();

  const payments = await Payment.find({
    status: { $in: [PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.PAID] }
  })
    .select('_id customer order amount paymentTime verifiedAt createdAt')
    .sort({ createdAt: 1 })
    .lean();

  const summaries = new Map();
  for (const payment of payments) {
    const customerId = payment.customer.toString();
    const paidAt = payment.paymentTime || payment.verifiedAt || payment.createdAt;
    const current = summaries.get(customerId) || {
      successfulPaymentCount: 0,
      totalPaidAmount: 0,
      creditedPayments: []
    };

    current.successfulPaymentCount += 1;
    current.totalPaidAmount += payment.amount;
    current.lastPaymentAt = paidAt;
    current.lastPaidOrder = payment.order;
    current.creditedPayments.push(payment._id);
    summaries.set(customerId, current);
  }

  if (summaries.size > 0) {
    await User.bulkWrite(
      [...summaries.entries()].map(([customerId, paymentSummary]) => ({
        updateOne: {
          filter: { _id: customerId },
          update: { $set: { paymentSummary } }
        }
      }))
    );
  }

  console.log(`Payment summaries migrated for ${summaries.size} customers`);
};

migratePaymentSummaries()
  .catch((error) => {
    console.error('Payment summary migration failed', {
      message: error.message,
      code: error.code
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
