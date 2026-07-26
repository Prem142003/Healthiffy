import { ROLES } from '../constants/role.constants.js';
import { Branch } from '../models/Branch.model.js';
import { User } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const populateUser = (query) => query.populate('assignedBranch', 'name slug status');

export const getUsers = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { email: new RegExp(query.search, 'i') },
      { phone: new RegExp(query.search, 'i') }
    ];
  }

  const [users, total] = await Promise.all([
    populateUser(User.find(filter).sort(query.sort || '-createdAt').skip(skip).limit(limit)),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const createWorker = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) throw new AppError('A user with this email already exists', 409);

  const branch = await Branch.findOne({ _id: payload.assignedBranch, isActive: true });
  if (!branch) throw new AppError('Assigned branch is invalid', 400);

  const user = await User.create({
    ...payload,
    role: ROLES.WORKER,
    isEmailVerified: true
  });

  return populateUser(User.findById(user._id));
};

export const updateUser = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const nextAssignedBranch = 'assignedBranch' in payload ? payload.assignedBranch : user.assignedBranch;
  if (user.role === ROLES.WORKER && !nextAssignedBranch) {
    throw new AppError('Worker must be assigned to a branch', 400);
  }

  if (nextAssignedBranch) {
    const branch = await Branch.findOne({ _id: nextAssignedBranch, isActive: true });
    if (!branch) throw new AppError('Assigned branch is invalid', 400);
  }

  return populateUser(User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true }));
};
