import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  createBranchHandler,
  deleteBranchHandler,
  getAdminBranch,
  getPublicBranch,
  listAdminBranches,
  listPublicBranches,
  updateBranchHandler,
  updateBranchStatusHandler
} from '../controllers/branch.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();
const adminOnly = [authenticate, authorizeRoles(ROLES.ADMIN)];

router.get('/', listPublicBranches);
router.get('/admin/all', adminOnly, listAdminBranches);
router.get('/admin/:id', adminOnly, getAdminBranch);
router.post('/', adminOnly, createBranchHandler);
router.patch('/:id/status', adminOnly, updateBranchStatusHandler);
router.patch('/:id', adminOnly, updateBranchHandler);
router.delete('/:id', adminOnly, deleteBranchHandler);
router.get('/:id', getPublicBranch);

export default router;
