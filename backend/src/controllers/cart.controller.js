import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  addCartItem,
  checkoutCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from '../services/cart.service.js';
import {
  validateAddCartItem,
  validateCheckout,
  validateUpdateCartItem
} from '../validators/cart.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getCartHandler = catchAsync(async (req, res) => {
  const data = await getCart(req.user._id);
  sendSuccess(res, 200, 'Cart fetched', data);
});

export const addCartItemHandler = catchAsync(async (req, res) => {
  const payload = validateAddCartItem(req.body);
  const data = await addCartItem({
    userId: req.user._id,
    menuItemId: payload.menuItem,
    quantity: payload.quantity
  });
  sendSuccess(res, 200, 'Cart item added', data);
});

export const updateCartItemHandler = catchAsync(async (req, res) => {
  const payload = validateUpdateCartItem(req.body);
  const data = await updateCartItem({
    userId: req.user._id,
    menuItemId: req.params.menuItemId,
    quantity: payload.quantity
  });
  sendSuccess(res, 200, 'Cart item updated', data);
});

export const removeCartItemHandler = catchAsync(async (req, res) => {
  const data = await removeCartItem({
    userId: req.user._id,
    menuItemId: req.params.menuItemId
  });
  sendSuccess(res, 200, 'Cart item removed', data);
});

export const clearCartHandler = catchAsync(async (req, res) => {
  const data = await clearCart(req.user._id);
  sendSuccess(res, 200, 'Cart cleared', data);
});

export const checkoutCartHandler = catchAsync(async (req, res) => {
  const payload = validateCheckout(req.body);
  const data = await checkoutCart({
    userId: req.user._id,
    specialInstructions: payload.specialInstructions
  });
  sendSuccess(res, 201, 'Checkout successful', data);
});
