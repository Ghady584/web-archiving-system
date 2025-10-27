const Document = require('../models/Document');
const Notification = require('../models/Notification');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get all documents with filtering and pagination
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      category,
      subcategory,
      search,
      startDate,
      endDate,
      priority
    } = req.query;
    
    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (priority) query.priority = priority;
    
    // Date range filter
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { documentNumber: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sender: { $regex: search, $options: 'i' } },
        { recipient: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role-based filtering
    if (req.user.role === 'archivist') {
      // Archivists can see archived and ready-to-archive documents
      query.status = { $in: ['archived', 'active'] };
    }
    
    // Execute query with pagination
    const documents = await Document.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('createdBy', 'username fullName')
      .populate('archivedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    // Get total documents count
    const count = await Document.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: documents.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('category', 'name description')
      .populate('subcategory', 'name description')
      .populate('createdBy', 'username fullName email')
      .populate('lastModifiedBy', 'username fullName')
      .populate('archivedBy', 'username fullName')
      .populate('notes.createdBy', 'username fullName');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'الكتاب غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new document
// @route   POST /api/documents
// @access  Private (Admin, Data Entry)
exports.createDocument = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      req.body.scannedImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }
    
    const document = await Document.create(req.body);
    
    // Create notification for all users
    const users = await require('../models/User').find({ isActive: true });
    const notifications = users
      .filter(user => user._id.toString() !== req.user.id)
      .map(user => ({
        recipient: user._id,
        type: 'new_document',
        title: 'كتاب جديد',
        message: `تم إضافة كتاب جديد: ${document.title}`,
        relatedDocument: document._id,
        priority: document.priority === 'urgent' ? 'high' : 'medium'
      }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الكتاب بنجاح',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private (Admin, Data Entry)
exports.updateDocument = async (req, res, next) => {
  try {
    let document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'الكتاب غير موجود'
      });
    }
    
    // Add last modified by
    req.body.lastModifiedBy = req.user.id;
    
    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      
      req.body.scannedImages = [...document.scannedImages, ...newImages];
    }
    
    document = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث الكتاب بنجاح',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private/Admin
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'الكتاب غير موجود'
      });
    }
    
    // Delete associated files
    if (document.scannedImages && document.scannedImages.length > 0) {
      for (const image of document.scannedImages) {
        try {
          await fs.unlink(image.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }
    
    await document.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الكتاب بنجاح',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive document
// @route   PUT /api/documents/:id/archive
// @access  Private (Admin, Archivist)
exports.archiveDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'الكتاب غير موجود'
      });
    }
    
    if (document.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'الكتاب مؤرشف بالفعل'
      });
    }
    
    document.status = 'archived';
    document.archiveDate = Date.now();
    document.archivedBy = req.user.id;
    
    await document.save();
    
    res.status(200).json({
      success: true,
      message: 'تم أرشفة الكتاب بنجاح',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore archived document
// @route   PUT /api/documents/:id/restore
// @access  Private (Admin, Archivist)
exports.restoreDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'الكتاب غير موجود'
      });
    }
    
    if (document.status !== 'archived') {
      return res.status(400).json({
        success: false,
        message: 'الكتاب ليس مؤرشفاً'
      });
    }
    
    document.status = 'active';
    document.archiveDate = null;
    document.archivedBy = null;
    
    await document.save();
    
    res.status(200).json({
      success: true,
      message: 'تم استعادة الكتاب بنجاح',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to document
// @route   POST /api/documents/:id/notes
// @access  Private
exports.addNote = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'الكتاب غير موجود'
      });
    }
    
    document.notes.push({
      content: req.body.content,
      createdBy: req.user.id
    });
    
    await document.save();
    
    res.status(200).json({
      success: true,
      message: 'تم إضافة الملاحظة بنجاح',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document statistics
// @route   GET /api/documents/stats/overview
// @access  Private
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await Document.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          total: [
            { $count: 'count' }
          ],
          recentDocuments: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                documentNumber: 1,
                title: 1,
                type: 1,
                status: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download document file
// @route   GET /api/documents/:id/download/:fileId
// @access  Private
exports.downloadFile = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'الكتاب غير موجود'
      });
    }

    // Find the file in scannedImages
    const fileId = req.params.fileId;
    const file = document.scannedImages.find(img => img._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }

    // Use the file path directly (multer stores absolute paths)
    const filePath = file.path;

    console.log('File to download:', {
      filename: file.filename,
      originalName: file.originalName,
      path: filePath,
      exists: require('fs').existsSync(filePath)
    });

    // Check if file exists on disk
    if (!require('fs').existsSync(filePath)) {
      console.error('File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود على الخادم'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);

    // Send file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'فشل تحميل الملف'
          });
        }
      } else {
        console.log('File sent successfully:', file.originalName);
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    next(error);
  }
};
