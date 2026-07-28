import { api } from './api';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  googleLogin: (payload) => api.post('/auth/google', payload),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  refreshToken: () => api.post('/auth/refresh-token'),
  changePassword: (payload) => api.patch('/auth/change-password', payload),
  deleteAccount: (payload) => api.delete('/auth/me', { data: payload }),
  me: () => api.get('/auth/me')
};
