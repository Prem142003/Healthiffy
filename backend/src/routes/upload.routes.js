import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import { uploadImageHandler } from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';

const router = Router();

router.post(
  '/image',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.CUSTOMER),
  uploadImage.single('image'),
  uploadImageHandler
);

export default router;
