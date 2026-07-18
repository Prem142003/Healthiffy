import { api } from './api';

export const orderApi = {
  createOrder: (payload) => api.post('/orders', payload),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAdminOrders: (params) => api.get('/orders/admin/all', { params }),
  updateOrderStatus: (id, payload) => api.patch(`/orders/${id}/status`, payload),
  cancelOrder: (id, payload) => api.patch(`/orders/${id}/cancel`, payload)
};
