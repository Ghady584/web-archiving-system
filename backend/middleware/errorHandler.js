// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'المورد غير موجود';
    error = { statusCode: 404, message };
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} موجود مسبقاً`;
    error = { statusCode: 400, message };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'رمز التوثيق غير صالح';
    error = { statusCode: 401, message };
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'انتهت صلاحية رمز التوثيق';
    error = { statusCode: 401, message };
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
