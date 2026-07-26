import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import { listWorkerOrders } from '../controllers/worker.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.WORKER));

router.get('/orders', listWorkerOrders);

export default router;
