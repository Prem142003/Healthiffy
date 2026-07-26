import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  createOrderHandler,
  getOrderHandler,
  listAdminOrders,
  listMyOrders
} from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles(ROLES.CUSTOMER, ROLES.ADMIN), createOrderHandler);
router.get('/my-orders', authorizeRoles(ROLES.CUSTOMER, ROLES.ADMIN), listMyOrders);
router.get('/admin/all', authorizeRoles(ROLES.ADMIN), listAdminOrders);
router.get('/:id', getOrderHandler);

export default router;
