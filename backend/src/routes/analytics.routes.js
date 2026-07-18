import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  getAnalyticsSummaryHandler,
  getBestSellingItemsHandler,
  getBranchRevenueHandler,
  getRevenueChartHandler
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/summary', getAnalyticsSummaryHandler);
router.get('/revenue', getRevenueChartHandler);
router.get('/branch-revenue', getBranchRevenueHandler);
router.get('/best-selling-items', getBestSellingItemsHandler);

export default router;
