import mongoose from 'mongoose';
import { env } from '../config/env.config.js';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    ...(env.mongoDbName ? { dbName: env.mongoDbName } : {})
  });
  console.log('MongoDB connected');
};
