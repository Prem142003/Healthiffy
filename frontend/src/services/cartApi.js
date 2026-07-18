import { api } from './api';

export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (payload) => api.post('/cart/items', payload),
  updateItem: (menuItemId, payload) => api.patch(`/cart/items/${menuItemId}`, payload),
  removeItem: (menuItemId) => api.delete(`/cart/items/${menuItemId}`),
  clearCart: () => api.delete('/cart'),
  checkout: (payload) => api.post('/cart/checkout', payload)
};
