const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    
    const query = { recipient: req.user.id };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('relatedDocument', 'documentNumber title type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      total: count,
      unreadCount,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }
    
    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث الإشعار',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: Date.now() }
    );
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث جميع الإشعارات'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الإشعار',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
exports.clearReadNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({
      recipient: req.user.id,
      isRead: true
    });
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الإشعارات المقروءة'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res, next) => {
  try {
    const { recipients, title, message, type, priority, relatedDocument } = req.body;
    
    // If recipients is 'all', get all active users
    let recipientIds = recipients;
    if (recipients === 'all') {
      const User = require('../models/User');
      const users = await User.find({ isActive: true }).select('_id');
      recipientIds = users.map(user => user._id);
    }
    
    // Create notifications for all recipients
    const notifications = recipientIds.map(recipientId => ({
      recipient: recipientId,
      type: type || 'system',
      title,
      message,
      priority: priority || 'medium',
      relatedDocument
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({
      success: true,
      message: 'تم إرسال الإشعارات بنجاح',
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
};
