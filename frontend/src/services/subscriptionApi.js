import { api } from './api';

export const subscriptionApi = {
  getPlans: (params) => api.get('/subscriptions/plans', { params }),
  getAdminPlans: (params) => api.get('/subscriptions/plans/admin/all', { params }),
  createPlan: (payload) => api.post('/subscriptions/plans', payload),
  updatePlan: (id, payload) => api.patch(`/subscriptions/plans/${id}`, payload),
  deactivatePlan: (id) => api.delete(`/subscriptions/plans/${id}`),
  createPurchase: (payload) => api.post('/subscriptions/purchase', payload),
  getPurchaseStatus: (purchaseId) =>
    api.get(`/subscriptions/purchases/${purchaseId}/cashfree/status`),
  getMySubscriptions: () => api.get('/subscriptions/my'),
  getMyDeliveryHistory: (params) =>
    api.get('/subscriptions/my/delivery-history', { params }),
  getWorkerCustomers: (params) =>
    api.get('/subscriptions/worker/customers', { params }),
  markDelivered: (id, payload = {}) => api.post(`/subscriptions/${id}/deliver`, payload),
  getWorkerDeliveryHistory: (params) =>
    api.get('/subscriptions/worker/delivery-history', { params }),
  getAdminCustomers: (params) =>
    api.get('/subscriptions/admin/customers', { params }),
  getAdminDeliveryHistory: (params) =>
    api.get('/subscriptions/admin/delivery-history', { params }),
  getAdminAnalytics: () => api.get('/subscriptions/admin/analytics')
};

