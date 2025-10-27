const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا المورد'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير نشط'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالوصول إلى هذا المورد'
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `دور ${req.user.role} غير مصرح له بالوصول إلى هذا المورد`
      });
    }
    next();
  };
};

// Check specific permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.getPermissions();
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك الصلاحية للقيام بهذا الإجراء'
      });
    }
    next();
  };
};
