import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  createWorkerHandler,
  listUsersHandler,
  listWorkersHandler,
  updateUserHandler
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/', listUsersHandler);
router.get('/workers', listWorkersHandler);
router.post('/workers', createWorkerHandler);
router.patch('/:id', updateUserHandler);

export default router;
