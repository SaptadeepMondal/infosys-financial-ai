import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// MARK: Auth Service
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (email, password, full_name, role = 'Financial Analyst') => {
    const res = await api.post('/auth/register', { email, password, full_name, role });
    if (res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};

// MARK: Workspace Service
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

// MARK: Document Service
export const documentService = {
  uploadDocument: async (file, workspace_id, company_name = 'Infosys Limited', filing_type = 'Annual Report', fiscal_year = 2024, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace_id', workspace_id);
    formData.append('company_name', company_name);
    formData.append('filing_type', filing_type);
    formData.append('fiscal_year', fiscal_year);

    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return res.data;
  },
  getDocuments: async (workspace_id = null) => {
    const url = workspace_id ? `/documents?workspace_id=${workspace_id}` : '/documents';
    const res = await api.get(url);
    return res.data.documents || res.data;
  },
  deleteDocument: async (id) => {
    await api.delete(`/documents/${id}`);
    return true;
  },
};

// MARK: Chat Service
export const chatService = {
  query: async (query, workspace_id, company_name = 'Infosys Limited') => {
    const res = await api.post('/chat/query', { query, workspace_id, company_name });
    return res.data;
  },
  getHistory: async (workspace_id) => {
    const res = await api.get(`/chat/history/${workspace_id}`);
    return res.data;
  },
};

// MARK: Report Service
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
    const res = await api.post('/reports', { title, workspace_id, company_name });
    return res.data;
  },
  exportReport: async (id) => {
    const res = await api.get(`/reports/${id}/export`, { responseType: 'text' });
    return res.data;
  },
};

// MARK: Dashboard Service
export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};

export default api;
