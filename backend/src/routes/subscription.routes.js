import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  createPlanHandler,
  createPurchaseHandler,
  deactivatePlanHandler,
  getAdminAnalyticsHandler,
  getAdminCustomersHandler,
  getAdminDeliveryHistoryHandler,
  getMyDeliveryHistoryHandler,
  getMySubscriptionsHandler,
  getPurchaseStatusHandler,
  getWorkerCustomersHandler,
  getWorkerDeliveryHistoryHandler,
  listAdminPlans,
  listPublicPlans,
  markTodayDeliveredHandler,
  updatePlanHandler
} from '../controllers/subscription.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();
const adminOnly = [authenticate, authorizeRoles(ROLES.ADMIN)];
const workerOnly = [authenticate, authorizeRoles(ROLES.WORKER)];
const customerOnly = [authenticate, authorizeRoles(ROLES.CUSTOMER)];

router.get('/plans', listPublicPlans);
router.get('/plans/admin/all', adminOnly, listAdminPlans);
router.post('/plans', adminOnly, createPlanHandler);
router.patch('/plans/:id', adminOnly, updatePlanHandler);
router.delete('/plans/:id', adminOnly, deactivatePlanHandler);

router.post('/purchase', customerOnly, createPurchaseHandler);
router.get('/purchases/:purchaseId/cashfree/status', customerOnly, getPurchaseStatusHandler);
router.get('/my', customerOnly, getMySubscriptionsHandler);
router.get('/my/delivery-history', customerOnly, getMyDeliveryHistoryHandler);

router.get('/worker/customers', workerOnly, getWorkerCustomersHandler);
router.get('/worker/delivery-history', workerOnly, getWorkerDeliveryHistoryHandler);
router.post('/:id/deliver', workerOnly, markTodayDeliveredHandler);

router.get('/admin/customers', adminOnly, getAdminCustomersHandler);
router.get('/admin/delivery-history', adminOnly, getAdminDeliveryHistoryHandler);
router.get('/admin/analytics', adminOnly, getAdminAnalyticsHandler);

export default router;

