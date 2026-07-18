import { createSlug } from '../helpers/slug.helper.js';
import { Branch } from '../models/Branch.model.js';
import { Category } from '../models/Category.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { AppError } from '../utils/AppError.js';

const buildUniqueSlug = async (name, branchId, menuItemIdToIgnore = null) => {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await MenuItem.exists({
      slug,
      branch: branchId,
      ...(menuItemIdToIgnore ? { _id: { $ne: menuItemIdToIgnore } } : {})
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

const buildFilter = (query, { includeInactive = false } = {}) => {
  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
    filter.isAvailable = true;
  }

  if (query.branch) filter.branch = query.branch;
  if (query.category) filter.category = query.category;
  if (query.foodType) filter.foodType = query.foodType.toString().trim().toUpperCase();
  if (query.isBestseller !== undefined) filter.isBestseller = query.isBestseller === 'true' || query.isBestseller === true;
  if (query.isAvailable !== undefined && includeInactive) filter.isAvailable = query.isAvailable === 'true' || query.isAvailable === true;
  if (query.isActive !== undefined && includeInactive) filter.isActive = query.isActive === 'true' || query.isActive === true;
  if (query.search) filter.$text = { $search: query.search };

  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filter.price = {};
    if (Number.isFinite(minPrice)) filter.price.$gte = minPrice;
    if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice;
  }

  return filter;
};

const populateMenuItem = (query) =>
  query
    .populate('branch', 'name slug status isActive')
    .populate('category', 'name slug isActive');

const assertActiveReferences = async ({ branch, category }) => {
  const [branchDoc, categoryDoc] = await Promise.all([
    Branch.findOne({ _id: branch, isActive: true }),
    Category.findOne({ _id: category, isActive: true })
  ]);

  if (!branchDoc) throw new AppError('Active branch is required', 400);
  if (!categoryDoc) throw new AppError('Active category is required', 400);
};

export const createMenuItem = async (payload, userId) => {
  await assertActiveReferences(payload);
  const slug = await buildUniqueSlug(payload.name, payload.branch);

  const menuItem = await MenuItem.create({
    ...payload,
    slug,
    createdBy: userId,
    updatedBy: userId
  });

  return getMenuItemById(menuItem._id, { includeInactive: true });
};

export const getMenuItems = async (query = {}, options = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildFilter(query, options);
  const sort = query.sort || '-createdAt';

  const [menuItems, total] = await Promise.all([
    populateMenuItem(MenuItem.find(filter).sort(sort).skip(skip).limit(limit)),
    MenuItem.countDocuments(filter)
  ]);

  return {
    menuItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getMenuItemById = async (menuItemId, options = {}) => {
  const menuItem = await populateMenuItem(
    MenuItem.findOne({
      _id: menuItemId,
      ...(options.includeInactive ? {} : { isActive: true, isAvailable: true })
    })
  );

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  return menuItem;
};

export const updateMenuItem = async (menuItemId, payload, userId) => {
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) throw new AppError('Menu item not found', 404);

  const nextBranch = payload.branch || menuItem.branch;
  const nextCategory = payload.category || menuItem.category;

  if (payload.branch || payload.category) {
    await assertActiveReferences({ branch: nextBranch, category: nextCategory });
  }

  const nextPrice = payload.price ?? menuItem.price;
  const nextOfferPrice = payload.offerPrice ?? menuItem.offerPrice;
  if (nextOfferPrice !== undefined && nextOfferPrice > nextPrice) {
    throw new AppError('Offer price cannot be greater than price', 400);
  }

  if ((payload.name && payload.name !== menuItem.name) || (payload.branch && payload.branch.toString() !== menuItem.branch.toString())) {
    menuItem.slug = await buildUniqueSlug(payload.name || menuItem.name, nextBranch, menuItem._id);
  }

  Object.assign(menuItem, payload, { updatedBy: userId });
  await menuItem.save();
  return getMenuItemById(menuItem._id, { includeInactive: true });
};

export const updateMenuItemAvailability = (menuItemId, isAvailable, userId) =>
  updateMenuItem(menuItemId, { isAvailable }, userId);

export const deleteMenuItem = async (menuItemId, userId) => {
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) throw new AppError('Menu item not found', 404);

  menuItem.isActive = false;
  menuItem.updatedBy = userId;
  await menuItem.save();
  return getMenuItemById(menuItem._id, { includeInactive: true });
};
