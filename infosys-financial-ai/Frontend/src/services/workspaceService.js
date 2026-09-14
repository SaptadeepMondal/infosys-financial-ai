import api from './api';

export const workspaceService = {
  getWorkspaces: async () => {
    const res = await api.get('/workspaces');
    return res.data.workspaces || res.data;
  },

  getWorkspace: async (id) => {
    const res = await api.get(`/workspaces/${id}`);
    return res.data;
  },

  createWorkspace: async (name, description = '') => {
    const res = await api.post('/workspaces', { name, description });
    return res.data;
  },

  updateWorkspace: async (id, name, description) => {
    const res = await api.put(`/workspaces/${id}`, { name, description });
    return res.data;
  },

  deleteWorkspace: async (id) => {
    await api.delete(`/workspaces/${id}`);
    return true;
  },
};
