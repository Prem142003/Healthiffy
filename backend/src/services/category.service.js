import { createSlug } from '../helpers/slug.helper.js';
import { Category } from '../models/Category.model.js';
import { AppError } from '../utils/AppError.js';

const buildUniqueSlug = async (name, categoryIdToIgnore = null) => {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await Category.exists({
      slug,
      ...(categoryIdToIgnore ? { _id: { $ne: categoryIdToIgnore } } : {})
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildFilter = ({ includeInactive = false, search }) => {
  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
};

export const createCategory = async (payload, userId) => {
  const slug = await buildUniqueSlug(payload.name);
  return Category.create({
    ...payload,
    slug,
    createdBy: userId,
    updatedBy: userId
  });
};

export const getCategories = async (query = {}, options = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildFilter({
    includeInactive: options.includeInactive,
    search: query.search
  });

  const sort = query.sort || 'displayOrder name';
  const [categories, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit),
    Category.countDocuments(filter)
  ]);

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getCategoryById = async (categoryId, options = {}) => {
  const category = await Category.findOne({
    _id: categoryId,
    ...(options.includeInactive ? {} : { isActive: true })
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};

export const updateCategory = async (categoryId, payload, userId) => {
  const category = await getCategoryById(categoryId, { includeInactive: true });

  if (payload.name && payload.name !== category.name) {
    category.slug = await buildUniqueSlug(payload.name, category._id);
  }

  Object.assign(category, payload, { updatedBy: userId });
  await category.save();
  return category;
};

export const updateCategoryStatus = (categoryId, isActive, userId) =>
  updateCategory(categoryId, { isActive }, userId);

export const deleteCategory = async (categoryId, userId) => {
  const category = await getCategoryById(categoryId, { includeInactive: true });
  category.isActive = false;
  category.updatedBy = userId;
  await category.save();
  return category;
};
