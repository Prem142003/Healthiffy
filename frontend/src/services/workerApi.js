import { api } from './api';

export const workerApi = {
  getOrders: (params) => api.get('/worker/orders', { params }),
  updateOrderStatus: (id, payload) => api.patch(`/worker/orders/${id}/status`, payload)
};
