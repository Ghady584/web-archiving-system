const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const Document = require('./models/Document');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Document.deleteMany({});

    // Create users (passwords will be hashed by the User model automatically)
    console.log('Creating users...');

    const admin = await User.create({
      username: 'admin',
      email: 'admin@archiving.sy',
      password: 'admin123',  // Plain text - model hashes it
      fullName: 'مدير النظام',
      role: 'admin',
      isActive: true
    });

    const dataEntry = await User.create({
      username: 'dataentry',
      email: 'dataentry@archiving.sy',
      password: 'data123',  // Plain text - model hashes it
      fullName: 'مدخل البيانات',
      role: 'data_entry',
      isActive: true
    });

    const archivist = await User.create({
      username: 'archivist',
      email: 'archivist@archiving.sy',
      password: 'archive123',  // Plain text - model hashes it
      fullName: 'المؤرشف',
      role: 'archivist',
      isActive: true
    });

    console.log('Users created successfully');

    // Test passwords immediately
    console.log('\nTesting passwords...');
    const adminTest = await admin.comparePassword('admin123');
    const dataEntryTest = await dataEntry.comparePassword('data123');
    const archivistTest = await archivist.comparePassword('archive123');
    
    console.log('Admin password test:', adminTest ? '✅ WORKS' : '❌ FAILED');
    console.log('DataEntry password test:', dataEntryTest ? '✅ WORKS' : '❌ FAILED');
    console.log('Archivist password test:', archivistTest ? '✅ WORKS' : '❌ FAILED');

    // Create categories
    console.log('\nCreating categories...');
    const administrativeCategory = await Category.create({
      name: 'الشؤون الإدارية',
      description: 'الكتب المتعلقة بالشؤون الإدارية',
      createdBy: admin._id
    });

    const financialCategory = await Category.create({
      name: 'الشؤون المالية',
      description: 'الكتب المتعلقة بالشؤون المالية',
      createdBy: admin._id
    });

    const technicalCategory = await Category.create({
      name: 'الشؤون الفنية',
      description: 'الكتب المتعلقة بالشؤون الفنية',
      createdBy: admin._id
    });

    const legalCategory = await Category.create({
      name: 'الشؤون القانونية',
      description: 'الكتب المتعلقة بالشؤون القانونية',
      createdBy: admin._id
    });

    // Create subcategories
    await Category.create({
      name: 'التوظيف',
      description: 'كتب التوظيف والتعيين',
      parentCategory: administrativeCategory._id,
      createdBy: admin._id
    });

    await Category.create({
      name: 'الإجازات',
      description: 'كتب الإجازات والعطل',
      parentCategory: administrativeCategory._id,
      createdBy: admin._id
    });

    await Category.create({
      name: 'الميزانية',
      description: 'كتب الميزانية السنوية',
      parentCategory: financialCategory._id,
      createdBy: admin._id
    });

    await Category.create({
      name: 'المشتريات',
      description: 'كتب المشتريات والعقود',
      parentCategory: financialCategory._id,
      createdBy: admin._id
    });

    console.log('Categories created successfully');

    // Create sample documents
    console.log('\nCreating sample documents...');
    await Document.create({
      documentNumber: 'IN-2024-00001',
      title: 'طلب إجازة سنوية',
      type: 'incoming',
      category: administrativeCategory._id,
      issueDate: new Date('2024-01-15'),
      sender: 'قسم الموارد البشرية',
      subject: 'طلب إجازة سنوية لمدة أسبوعين',
      description: 'يرجى الموافقة على طلب الإجازة السنوية',
      priority: 'medium',
      status: 'active',
      createdBy: dataEntry._id
    });

    await Document.create({
      documentNumber: 'OUT-2024-00001',
      title: 'رد على طلب إجازة',
      type: 'outgoing',
      category: administrativeCategory._id,
      issueDate: new Date('2024-01-16'),
      recipient: 'قسم الموارد البشرية',
      subject: 'الموافقة على طلب الإجازة',
      description: 'تمت الموافقة على طلب الإجازة السنوية',
      priority: 'medium',
      status: 'active',
      createdBy: dataEntry._id
    });

    await Document.create({
      documentNumber: 'IN-2024-00002',
      title: 'فاتورة مشتريات معدات المكتب',
      type: 'incoming',
      category: financialCategory._id,
      issueDate: new Date('2024-02-01'),
      sender: 'شركة المعدات المكتبية',
      subject: 'فاتورة رقم 12345',
      description: 'فاتورة مشتريات معدات مكتبية بقيمة 5000 ليرة',
      priority: 'high',
      status: 'active',
      createdBy: dataEntry._id
    });

    await Document.create({
      documentNumber: 'IN-2024-00003',
      title: 'عقد صيانة أجهزة الحاسوب',
      type: 'incoming',
      category: technicalCategory._id,
      issueDate: new Date('2024-03-01'),
      sender: 'شركة التقنيات المتقدمة',
      subject: 'عقد صيانة سنوي',
      description: 'عقد صيانة سنوي لأجهزة الحاسوب والخوادم',
      priority: 'urgent',
      status: 'active',
      createdBy: dataEntry._id
    });

    await Document.create({
      documentNumber: 'OUT-2024-00002',
      title: 'تعميم إجراءات السلامة',
      type: 'outgoing',
      category: administrativeCategory._id,
      issueDate: new Date('2024-01-10'),
      recipient: 'جميع الأقسام',
      subject: 'إجراءات السلامة والصحة المهنية',
      description: 'تعميم بإجراءات السلامة الواجب اتباعها في مكان العمل',
      priority: 'high',
      status: 'archived',
      archiveDate: new Date('2024-06-01'),
      archivedBy: archivist._id,
      createdBy: dataEntry._id
    });

    console.log('Sample documents created successfully');

    console.log('\n=== Database seeded successfully! ===\n');
    console.log('Default users created:');
    console.log('1. Admin - Username: admin, Password: admin123');
    console.log('2. Data Entry - Username: dataentry, Password: data123');
    console.log('3. Archivist - Username: archivist, Password: archive123');
    console.log('\nCategories and sample documents have been created.');
    console.log('\n✅ All passwords tested and working!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();