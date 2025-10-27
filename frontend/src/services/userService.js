import api from './api';

const userService = {
  // Get all users
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Toggle active status
  toggleActive: async (id) => {
    const response = await api.put(`/users/${id}/toggle-active`);
    return response.data;
  },
};

export default userService;
