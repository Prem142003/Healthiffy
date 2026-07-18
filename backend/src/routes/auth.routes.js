import { Router } from 'express';
import {
  authRoles,
  changeUserPassword,
  forgotPassword,
  getMe,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  resendVerificationEmail,
  resetUserPassword,
  verifyEmailAddress
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/security.middleware.js';

const router = Router();

router.get('/roles', authRoles);
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/verify-email', authRateLimiter, verifyEmailAddress);
router.post('/resend-verification', authRateLimiter, resendVerificationEmail);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetUserPassword);

router.use(authenticate);
router.get('/me', getMe);
router.post('/logout-all', logoutAll);
router.patch('/change-password', changeUserPassword);

export default router;
