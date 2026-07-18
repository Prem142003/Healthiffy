import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logoutLocal, refreshSession } from './slices/authSlice';
import analyticsReducer from './slices/analyticsSlice';
import branchReducer from './slices/branchSlice';
import cartReducer from './slices/cartSlice';
import categoryReducer from './slices/categorySlice';
import menuItemReducer from './slices/menuItemSlice';
import orderReducer from './slices/orderSlice';
import paymentReducer from './slices/paymentSlice';
import userReducer from './slices/userSlice';
import { attachAuthInterceptors } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
    branches: branchReducer,
    cart: cartReducer,
    categories: categoryReducer,
    menuItems: menuItemReducer,
    orders: orderReducer,
    payments: paymentReducer,
    users: userReducer
  }
});

attachAuthInterceptors(store, { refreshSession, logoutLocal });
