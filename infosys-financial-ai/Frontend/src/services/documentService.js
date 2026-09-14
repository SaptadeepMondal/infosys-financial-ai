import api from './api';

export const documentService = {
  uploadDocument: async (file, workspace_id, company_name = 'Infosys Limited', filing_type = 'Annual Report', fiscal_year = 2024, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace_id', workspace_id);
    formData.append('company_name', company_name);
    formData.append('filing_type', filing_type);
    formData.append('fiscal_year', fiscal_year);

    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
