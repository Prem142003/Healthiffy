import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  createBranch,
  deleteBranch,
  getBranchById,
  getBranches,
  updateBranch,
  updateBranchStatus
} from '../services/branch.service.js';
import {
  validateBranchStatus,
  validateCreateBranch,
  validateUpdateBranch
} from '../validators/branch.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listPublicBranches = catchAsync(async (req, res) => {
  const data = await getBranches(req.query);
  sendSuccess(res, 200, 'Branches fetched', data);
});

export const listAdminBranches = catchAsync(async (req, res) => {
  const data = await getBranches(req.query, { includeInactive: true });
  sendSuccess(res, 200, 'Branches fetched', data);
});

export const getPublicBranch = catchAsync(async (req, res) => {
  const branch = await getBranchById(req.params.id);
  sendSuccess(res, 200, 'Branch fetched', { branch });
});

export const getAdminBranch = catchAsync(async (req, res) => {
  const branch = await getBranchById(req.params.id, { includeInactive: true });
  sendSuccess(res, 200, 'Branch fetched', { branch });
});

export const createBranchHandler = catchAsync(async (req, res) => {
  const payload = validateCreateBranch(req.body);
  const branch = await createBranch(payload, req.user._id);
  sendSuccess(res, 201, 'Branch created', { branch });
});

export const updateBranchHandler = catchAsync(async (req, res) => {
  const payload = validateUpdateBranch(req.body);
  const branch = await updateBranch(req.params.id, payload, req.user._id);
  sendSuccess(res, 200, 'Branch updated', { branch });
});

export const updateBranchStatusHandler = catchAsync(async (req, res) => {
  const payload = validateBranchStatus(req.body);
  const branch = await updateBranchStatus(req.params.id, payload.status, req.user._id);
  sendSuccess(res, 200, 'Branch status updated', { branch });
});

export const deleteBranchHandler = catchAsync(async (req, res) => {
  const branch = await deleteBranch(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Branch deleted', { branch });
});
