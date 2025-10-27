const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (all authenticated users)
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategory);

// Admin only routes
router.post('/', authorize('admin'), createCategory);
router.put('/:id', authorize('admin'), updateCategory);
router.delete('/:id', authorize('admin'), deleteCategory);
router.put('/:id/toggle-active', authorize('admin'), toggleCategoryActive);

module.exports = router;
