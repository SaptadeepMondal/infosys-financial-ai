import api from './api';

export const chatService = {
  query: async (query, workspace_id, company_name = 'Infosys Limited') => {
    const res = await api.post('/chat/query', {
      query,
      workspace_id,
      company_name,
    });
    return res.data;
  },

  getHistory: async (workspace_id) => {
    const res = await api.get(`/chat/history/${workspace_id}`);
    return res.data;
  },
};
