import api from './api';

const documentService = {
  // Get all documents with filters
  getDocuments: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Get single document
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Create document
  createDocument: async (formData) => {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update document
  updateDocument: async (id, formData) => {
    const response = await api.put(`/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Archive document
  archiveDocument: async (id) => {
    const response = await api.put(`/documents/${id}/archive`);
    return response.data;
  },

  // Restore document
  restoreDocument: async (id) => {
    const response = await api.put(`/documents/${id}/restore`);
    return response.data;
  },

  // Add note
  addNote: async (id, content) => {
    const response = await api.post(`/documents/${id}/notes`, { content });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/documents/stats/overview');
    return response.data;
  },

  // Download file
  downloadFile: async (documentId, fileId, filename) => {
    try {
      const response = await api.get(`/documents/${documentId}/download/${fileId}`, {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },
};

export default documentService;
