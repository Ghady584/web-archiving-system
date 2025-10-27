const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'الرجاء إدخال اسم المستخدم'],
    unique: true,
    trim: true,
    minlength: [3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل']
  },
  email: {
    type: String,
    required: [true, 'الرجاء إدخال البريد الإلكتروني'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'الرجاء إدخال بريد إلكتروني صالح']
  },
  password: {
    type: String,
    required: [true, 'الرجاء إدخال كلمة المرور'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'الرجاء إدخال الاسم الكامل']
  },
  role: {
    type: String,
    enum: ['admin', 'data_entry', 'archivist'],
    default: 'data_entry',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user permissions based on role
userSchema.methods.getPermissions = function() {
  const permissions = {
    admin: ['create', 'read', 'update', 'delete', 'archive', 'manage_users', 'manage_categories', 'view_reports'],
    data_entry: ['create', 'read', 'update'],
    archivist: ['read', 'archive', 'restore']
  };
  
  return permissions[this.role] || [];
};

module.exports = mongoose.model('User', userSchema);
