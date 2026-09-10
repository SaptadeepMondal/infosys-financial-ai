import api from './api';

export const comparisonService = {
  getCompanies: async (workspaceId = null) => {
    const url = workspaceId ? `/comparison/companies?workspace_id=${workspaceId}` : '/comparison/companies';
    const res = await api.get(url);
    return res.data;
  },
  compareCompanies: async (companyIds) => {
    const res = await api.post('/comparison/compare', { companyIds });
    return res.data;
  }
};
