import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus
} from '../services/category.service.js';
import {
  validateCategoryStatus,
  validateCreateCategory,
  validateUpdateCategory
} from '../validators/category.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listPublicCategories = catchAsync(async (req, res) => {
  const data = await getCategories(req.query);
  sendSuccess(res, 200, 'Categories fetched', data);
});

export const listAdminCategories = catchAsync(async (req, res) => {
  const data = await getCategories(req.query, { includeInactive: true });
  sendSuccess(res, 200, 'Categories fetched', data);
});

export const getPublicCategory = catchAsync(async (req, res) => {
  const category = await getCategoryById(req.params.id);
  sendSuccess(res, 200, 'Category fetched', { category });
});

export const getAdminCategory = catchAsync(async (req, res) => {
  const category = await getCategoryById(req.params.id, { includeInactive: true });
  sendSuccess(res, 200, 'Category fetched', { category });
});

export const createCategoryHandler = catchAsync(async (req, res) => {
  const payload = validateCreateCategory(req.body);
  const category = await createCategory(payload, req.user._id);
  sendSuccess(res, 201, 'Category created', { category });
});

export const updateCategoryHandler = catchAsync(async (req, res) => {
  const payload = validateUpdateCategory(req.body);
  const category = await updateCategory(req.params.id, payload, req.user._id);
  sendSuccess(res, 200, 'Category updated', { category });
});

export const updateCategoryStatusHandler = catchAsync(async (req, res) => {
  const payload = validateCategoryStatus(req.body);
  const category = await updateCategoryStatus(req.params.id, payload.isActive, req.user._id);
  sendSuccess(res, 200, 'Category status updated', { category });
});

export const deleteCategoryHandler = catchAsync(async (req, res) => {
  const category = await deleteCategory(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Category deleted', { category });
});
