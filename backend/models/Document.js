const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentNumber: {
    type: String,
    required: [true, 'الرجاء إدخال رقم الكتاب'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'الرجاء إدخال عنوان الكتاب'],
    trim: true
  },
  type: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: [true, 'الرجاء تحديد نوع الكتاب']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'الرجاء تحديد التصنيف']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  issueDate: {
    type: Date,
    required: [true, 'الرجاء إدخال تاريخ الإصدار'],
    default: Date.now
  },
  sender: {
    type: String,
    trim: true
  },
  recipient: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'pending'],
    default: 'active'
  },
  scannedImages: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  archiveDate: {
    type: Date
  },
  archiveReminderDate: {
    type: Date
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for search optimization
documentSchema.index({ documentNumber: 1 });
documentSchema.index({ title: 'text', subject: 'text', description: 'text' });
documentSchema.index({ issueDate: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ category: 1, subcategory: 1 });

// Auto-generate document number if not provided
documentSchema.pre('save', async function(next) {
  if (!this.documentNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    const prefix = this.type === 'incoming' ? 'IN' : 'OUT';
    this.documentNumber = `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
