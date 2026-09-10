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
  },
  exportComparison: async (companyIds) => {
    const res = await api.post('/comparison/export', { companyIds }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'comparison_report.md');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
