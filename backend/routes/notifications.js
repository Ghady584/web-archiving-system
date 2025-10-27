const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  createNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.delete('/clear-read', clearReadNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin only
router.post('/', authorize('admin'), createNotification);

module.exports = router;
