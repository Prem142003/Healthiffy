import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  getPublicPaymentSettingsHandler,
  listPaymentsHandler,
  rejectPaymentHandler,
  submitManualPaymentHandler,
  updatePaymentSettingsHandler,
  verifyPaymentHandler
} from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();
const adminOnly = [authenticate, authorizeRoles(ROLES.ADMIN)];

router.get('/settings/public', getPublicPaymentSettingsHandler);
router.patch('/settings', adminOnly, updatePaymentSettingsHandler);
router.post('/orders/:orderId/manual-confirm', authenticate, authorizeRoles(ROLES.CUSTOMER, ROLES.ADMIN), submitManualPaymentHandler);
router.get('/', adminOnly, listPaymentsHandler);
router.patch('/:id/verify', adminOnly, verifyPaymentHandler);
router.patch('/:id/reject', adminOnly, rejectPaymentHandler);

export default router;
