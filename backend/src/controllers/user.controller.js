import { ROLES } from '../constants/role.constants.js';
import { sendSuccess } from '../helpers/apiResponse.helper.js';
import { createWorker, getUsers, updateUser } from '../services/user.service.js';
import { validateCreateWorker, validateRoleQuery, validateUpdateUser } from '../validators/user.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listUsersHandler = catchAsync(async (req, res) => {
  const role = validateRoleQuery(req.query.role);
  const data = await getUsers({ ...req.query, role });
  sendSuccess(res, 200, 'Users fetched', data);
});

export const listWorkersHandler = catchAsync(async (req, res) => {
  const data = await getUsers({ ...req.query, role: ROLES.WORKER });
  sendSuccess(res, 200, 'Workers fetched', data);
});

export const createWorkerHandler = catchAsync(async (req, res) => {
  const payload = validateCreateWorker(req.body);
  const user = await createWorker(payload);
  sendSuccess(res, 201, 'Worker created', { user });
});

export const updateUserHandler = catchAsync(async (req, res) => {
  const payload = validateUpdateUser(req.body);
  const user = await updateUser(req.params.id, payload);
  sendSuccess(res, 200, 'User updated', { user });
});
