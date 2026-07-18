import { Router } from 'express';
import { ROLES } from '../constants/role.constants.js';
import {
  addCartItemHandler,
  checkoutCartHandler,
  clearCartHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemHandler
} from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.CUSTOMER, ROLES.ADMIN));

router.get('/', getCartHandler);
router.post('/items', addCartItemHandler);
router.patch('/items/:menuItemId', updateCartItemHandler);
router.delete('/items/:menuItemId', removeCartItemHandler);
router.delete('/', clearCartHandler);
router.post('/checkout', checkoutCartHandler);

export default router;
