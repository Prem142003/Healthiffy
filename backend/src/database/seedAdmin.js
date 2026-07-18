import dotenv from 'dotenv';
import { connectDB } from './connectDB.js';
import { ROLES } from '../constants/role.constants.js';
import { User } from '../models/User.model.js';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || 'Healthiffy Admin';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  await User.create({
    name,
    email,
    password,
    role: ROLES.ADMIN,
    isEmailVerified: true
  });

  console.log('Admin created:', email);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
