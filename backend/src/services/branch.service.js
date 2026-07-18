import { BRANCH_STATUS } from '../constants/branch.constants.js';
import { createSlug } from '../helpers/slug.helper.js';
import { Branch } from '../models/Branch.model.js';
import { AppError } from '../utils/AppError.js';

const buildUniqueSlug = async (name, branchIdToIgnore = null) => {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await Branch.exists({
      slug,
      ...(branchIdToIgnore ? { _id: { $ne: branchIdToIgnore } } : {})
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildFilter = ({ includeInactive = false, status, search }) => {
  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (status) {
    filter.status = status.toString().trim().toUpperCase();
  }

  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
};

export const createBranch = async (payload, userId) => {
  const slug = await buildUniqueSlug(payload.name);
  return Branch.create({
    ...payload,
    slug,
    createdBy: userId,
    updatedBy: userId
  });
};

export const getBranches = async (query = {}, options = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildFilter({
    includeInactive: options.includeInactive,
    status: query.status,
    search: query.search
  });

  const sort = query.sort || '-createdAt';
  const [branches, total] = await Promise.all([
    Branch.find(filter).sort(sort).skip(skip).limit(limit),
    Branch.countDocuments(filter)
  ]);

  return {
    branches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getBranchById = async (branchId, options = {}) => {
  const filter = {
    _id: branchId,
    ...(options.includeInactive ? {} : { isActive: true })
  };
  const branch = await Branch.findOne(filter);
  if (!branch) {
    throw new AppError('Branch not found', 404);
  }
  return branch;
};

export const updateBranch = async (branchId, payload, userId) => {
  const branch = await getBranchById(branchId, { includeInactive: true });

  if (payload.name && payload.name !== branch.name) {
    branch.slug = await buildUniqueSlug(payload.name, branch._id);
  }

  Object.assign(branch, payload, { updatedBy: userId });
  await branch.save();
  return branch;
};

export const updateBranchStatus = async (branchId, status, userId) =>
  updateBranch(branchId, { status: status || BRANCH_STATUS.OPEN }, userId);

export const deleteBranch = async (branchId, userId) => {
  const branch = await getBranchById(branchId, { includeInactive: true });
  branch.isActive = false;
  branch.updatedBy = userId;
  await branch.save();
  return branch;
};
