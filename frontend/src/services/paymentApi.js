import { api } from './api';

export const paymentApi = {
  getPublicSettings: () => api.get('/payments/settings/public'),
  updateSettings: (payload) => api.patch('/payments/settings', payload),
  submitManualPayment: (orderId, payload) => api.post(`/payments/orders/${orderId}/manual-confirm`, payload),
  getPayments: (params) => api.get('/payments', { params }),
  verifyPayment: (id) => api.patch(`/payments/${id}/verify`),
  rejectPayment: (id, payload) => api.patch(`/payments/${id}/reject`, payload)
};
