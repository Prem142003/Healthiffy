import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getAdminCategory,
  getPublicCategory,
  listAdminCategories,
  listPublicCategories,
  updateCategoryHandler,
  updateCategoryStatusHandler
} from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();
const adminOnly = [authenticate, authorizeRoles(ROLES.ADMIN)];

router.get('/', listPublicCategories);
router.get('/admin/all', adminOnly, listAdminCategories);
router.get('/admin/:id', adminOnly, getAdminCategory);
router.post('/', adminOnly, createCategoryHandler);
router.patch('/:id/status', adminOnly, updateCategoryStatusHandler);
router.patch('/:id', adminOnly, updateCategoryHandler);
router.delete('/:id', adminOnly, deleteCategoryHandler);
router.get('/:id', getPublicCategory);

export default router;
