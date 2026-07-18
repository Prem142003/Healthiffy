import { api } from './api';

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getRevenue: () => api.get('/analytics/revenue'),
  getBranchRevenue: () => api.get('/analytics/branch-revenue'),
  getBestSellingItems: () => api.get('/analytics/best-selling-items')
};
