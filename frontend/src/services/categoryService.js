import api from './api';

const categoryService = {
  // Get all categories
  getCategories: async (includeInactive = false) => {
    const response = await api.get('/categories', {
      params: { includeInactive },
    });
    return response.data;
  },

  // Get category tree
  getCategoryTree: async () => {
    const response = await api.get('/categories/tree');
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create category
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Toggle active status
  toggleActive: async (id) => {
    const response = await api.put(`/categories/${id}/toggle-active`);
    return response.data;
  },
};

export default categoryService;
