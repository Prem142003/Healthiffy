import { api } from './api';

export const branchApi = {
  getPublicBranches: (params) => api.get('/branches', { params }),
  getAdminBranches: (params) => api.get('/branches/admin/all', { params }),
  createBranch: (payload) => api.post('/branches', payload),
  updateBranch: (id, payload) => api.patch(`/branches/${id}`, payload),
  updateBranchStatus: (id, status) => api.patch(`/branches/${id}/status`, { status }),
  deleteBranch: (id) => api.delete(`/branches/${id}`)
};
