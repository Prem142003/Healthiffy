import { Router } from 'express';
import {
  authRoles,
  changeUserPassword,
  deleteUserAccount,
  getMe,
  googleLogin,
  login,
  logout,
  logoutAll,
  refreshToken
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/security.middleware.js';

const router = Router();

router.get('/roles', authRoles);
router.post('/google', authRateLimiter, googleLogin);
router.post('/login', authRateLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

router.use(authenticate);
router.get('/me', getMe);
router.delete('/me', deleteUserAccount);
router.post('/logout-all', logoutAll);
router.patch('/change-password', changeUserPassword);

export default router;
