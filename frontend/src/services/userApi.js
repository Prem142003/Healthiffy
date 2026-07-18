import { api } from './api';

export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getWorkers: (params) => api.get('/users/workers', { params }),
  createWorker: (payload) => api.post('/users/workers', payload),
  updateUser: (id, payload) => api.patch(`/users/${id}`, payload)
};
