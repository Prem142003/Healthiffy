import { api } from './api';

export const workerApi = {
  getOrders: (params) => api.get('/worker/orders', { params })
};
