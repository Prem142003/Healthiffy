import { api } from './api';

export const menuItemApi = {
  getPublicMenuItems: (params) => api.get('/menu-items', { params }),
  getAdminMenuItems: (params) => api.get('/menu-items/admin/all', { params }),
  createMenuItem: (payload) => api.post('/menu-items', payload),
  updateMenuItem: (id, payload) => api.patch(`/menu-items/${id}`, payload),
  updateMenuItemAvailability: (id, isAvailable) => api.patch(`/menu-items/${id}/availability`, { isAvailable }),
  deleteMenuItem: (id) => api.delete(`/menu-items/${id}`)
};
