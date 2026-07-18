import { Cart } from '../models/Cart.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { AppError } from '../utils/AppError.js';
import { createOrder } from './order.service.js';

const populateCart = (query) =>
  query
    .populate('branch', 'name slug status')
    .populate('items.menuItem', 'name slug isActive isAvailable');

const calculateSubtotal = (items) =>
  items.reduce((total, item) => total + (item.offerPriceSnapshot ?? item.priceSnapshot) * item.quantity, 0);

export const getCart = async (userId) => {
  const cart = await populateCart(Cart.findOne({ user: userId }));
  if (!cart) {
    return { cart: null };
  }
  return { cart };
};

export const addCartItem = async ({ userId, menuItemId, quantity }) => {
  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    isActive: true,
    isAvailable: true
  });

  if (!menuItem) {
    throw new AppError('Menu item is unavailable', 400);
  }

  let cart = await Cart.findOne({ user: userId });

  if (cart && cart.branch.toString() !== menuItem.branch.toString()) {
    throw new AppError('Cart can contain items from one branch only. Clear cart to switch branches.', 400);
  }

  if (!cart) {
    cart = new Cart({
      user: userId,
      branch: menuItem.branch,
      items: []
    });
  }

  const existingItem = cart.items.find((item) => item.menuItem.toString() === menuItem._id.toString());
  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, 50);
  } else {
    cart.items.push({
      menuItem: menuItem._id,
      nameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      offerPriceSnapshot: menuItem.offerPrice,
      imageSnapshot: menuItem.image?.url,
      quantity
    });
  }

  cart.subtotal = calculateSubtotal(cart.items);
  await cart.save();
  return getCart(userId);
};

export const updateCartItem = async ({ userId, menuItemId, quantity }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.find((cartItem) => cartItem.menuItem.toString() === menuItemId.toString());
  if (!item) throw new AppError('Cart item not found', 404);

  item.quantity = quantity;
  cart.subtotal = calculateSubtotal(cart.items);
  await cart.save();
  return getCart(userId);
};

export const removeCartItem = async ({ userId, menuItemId }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.items = cart.items.filter((item) => item.menuItem.toString() !== menuItemId.toString());
  cart.subtotal = calculateSubtotal(cart.items);

  if (cart.items.length === 0) {
    await Cart.deleteOne({ _id: cart._id });
    return { cart: null };
  }

  await cart.save();
  return getCart(userId);
};

export const clearCart = async (userId) => {
  await Cart.deleteOne({ user: userId });
  return { cart: null };
};

export const checkoutCart = async ({ userId, specialInstructions }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const order = await createOrder(
    {
      branch: cart.branch,
      items: cart.items.map((item) => ({
        menuItem: item.menuItem,
        quantity: item.quantity
      })),
      specialInstructions
    },
    userId
  );

  await Cart.deleteOne({ _id: cart._id });
  return { order, cart: null };
};
