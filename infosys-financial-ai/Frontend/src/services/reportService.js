import api from './api';

export const reportService = {
  getReports: async () => {
    const res = await api.get('/reports');
    return res.data.reports || res.data;
  },

  getReport: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  createReport: async (title, workspace_id, company_name = 'Infosys Limited') => {
    const res = await api.post('/reports', {
      title,
      workspace_id,
      company_name,
    });
    return res.data;
  },

  exportReport: async (id) => {
    const res = await api.get(`/reports/${id}/export`, {
      responseType: 'text',
    });
    return res.data;
  },
};
