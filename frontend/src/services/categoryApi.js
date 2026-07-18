import { api } from './api';

export const categoryApi = {
  getPublicCategories: (params) => api.get('/categories', { params }),
  getAdminCategories: (params) => api.get('/categories/admin/all', { params }),
  createCategory: (payload) => api.post('/categories', payload),
  updateCategory: (id, payload) => api.patch(`/categories/${id}`, payload),
  updateCategoryStatus: (id, isActive) => api.patch(`/categories/${id}/status`, { isActive }),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};
