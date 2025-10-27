const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    
    const query = includeInactive ? {} : { isActive: true };
    
    const categories = await Category.find(query)
      .populate('parentCategory', 'name')
      .populate('createdBy', 'username fullName')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category tree (main categories with subcategories)
// @route   GET /api/categories/tree
// @access  Private
exports.getCategoryTree = async (req, res, next) => {
  try {
    const mainCategories = await Category.find({ 
      parentCategory: null,
      isActive: true 
    }).sort({ name: 1 });
    
    const tree = await Promise.all(
      mainCategories.map(async (category) => {
        const subcategories = await Category.find({ 
          parentCategory: category._id,
          isActive: true 
        }).sort({ name: 1 });
        
        return {
          ...category.toObject(),
          subcategories
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: tree.length,
      data: tree
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name')
      .populate('createdBy', 'username fullName');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }
    
    // Get subcategories if this is a main category
    if (!category.parentCategory) {
      const subcategories = await Category.find({ 
        parentCategory: category._id 
      }).sort({ name: 1 });
      
      return res.status(200).json({
        success: true,
        data: {
          ...category.toObject(),
          subcategories
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء التصنيف بنجاح',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }
    
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث التصنيف بنجاح',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: category._id });
    
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف التصنيف لأنه يحتوي على تصنيفات فرعية'
      });
    }
    
    // Check if category is used in documents
    const Document = require('../models/Document');
    const documentsCount = await Document.countDocuments({
      $or: [
        { category: category._id },
        { subcategory: category._id }
      ]
    });
    
    if (documentsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف التصنيف لأنه مستخدم في ${documentsCount} كتاب`
      });
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'تم حذف التصنيف بنجاح',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle category active status
// @route   PUT /api/categories/:id/toggle-active
// @access  Private/Admin
exports.toggleCategoryActive = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود'
      });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.status(200).json({
      success: true,
      message: `تم ${category.isActive ? 'تفعيل' : 'تعطيل'} التصنيف بنجاح`,
      data: category
    });
  } catch (error) {
    next(error);
  }
};
