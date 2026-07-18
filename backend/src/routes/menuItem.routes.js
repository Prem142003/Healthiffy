import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  createMenuItemHandler,
  deleteMenuItemHandler,
  getAdminMenuItem,
  getPublicMenuItem,
  listAdminMenuItems,
  listPublicMenuItems,
  updateMenuItemAvailabilityHandler,
  updateMenuItemHandler
} from '../controllers/menuItem.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();
const adminOnly = [authenticate, authorizeRoles(ROLES.ADMIN)];

router.get('/', listPublicMenuItems);
router.get('/admin/all', adminOnly, listAdminMenuItems);
router.get('/admin/:id', adminOnly, getAdminMenuItem);
router.post('/', adminOnly, createMenuItemHandler);
router.patch('/:id/availability', adminOnly, updateMenuItemAvailabilityHandler);
router.patch('/:id', adminOnly, updateMenuItemHandler);
router.delete('/:id', adminOnly, deleteMenuItemHandler);
router.get('/:id', getPublicMenuItem);

export default router;
