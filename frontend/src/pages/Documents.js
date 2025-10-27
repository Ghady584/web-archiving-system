import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/documentService';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaArchive,
  FaFileAlt,
} from 'react-icons/fa';

const Documents = () => {
  const { user, hasPermission } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: 'active',
    category: '',
    subcategory: '',
    priority: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const response = await documentService.getDocuments(params);
      setDocuments(response.data);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total,
      });
    } catch (error) {
      toast.error('فشل تحميل الكتب');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleArchive = async (id) => {
    if (window.confirm('هل أنت متأكد من أرشفة هذا الكتاب؟')) {
      try {
        await documentService.archiveDocument(id);
        toast.success('تم أرشفة الكتاب بنجاح');
        fetchDocuments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل أرشفة الكتاب');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكتاب؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        await documentService.deleteDocument(id);
        toast.success('تم حذف الكتاب بنجاح');
        fetchDocuments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل حذف الكتاب');
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityText = (priority) => {
    const text = {
      urgent: 'عاجل',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
    };
    return text[priority] || 'متوسط';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">الكتب الإدارية</h1>
        {hasPermission('create') && (
          <Link
            to="/documents/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            كتاب جديد
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ابحث عن كتاب (الرقم، العنوان، المرسل، المستلم...)"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute right-3 top-4 text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            بحث
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 flex items-center gap-2 transition-colors"
          >
            <FaFilter />
            فلترة
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">نوع الكتاب</option>
              <option value="incoming">وارد</option>
              <option value="outgoing">صادر</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="archived">مؤرشف</option>
              <option value="pending">معلق</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الأولوية</option>
              <option value="urgent">عاجل</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">التصنيف</option>
              {categories
                .filter(cat => !cat.parentCategory)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="من تاريخ"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="إلى تاريخ"
            />

            <button
              onClick={() => {
                setFilters({
                  search: '',
                  type: '',
                  status: 'active',
                  category: '',
                  subcategory: '',
                  priority: '',
                  startDate: '',
                  endDate: '',
                  page: 1,
                  limit: 10,
                });
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">جاري التحميل...</div>
        </div>
      ) : documents.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    رقم الكتاب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الأولوية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaFileAlt className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {doc.documentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.title}
                      </div>
                      {doc.category && (
                        <div className="text-sm text-gray-500">
                          {doc.category.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doc.type === 'incoming'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {doc.type === 'incoming' ? 'وارد' : 'صادر'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          doc.priority
                        )}`}
                      >
                        {getPriorityText(doc.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.issueDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          to={`/documents/${doc._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="عرض"
                        >
                          <FaEye size={18} />
                        </Link>
                        {hasPermission('update') && (
                          <Link
                            to={`/documents/${doc._id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="تعديل"
                          >
                            <FaEdit size={18} />
                          </Link>
                        )}
                        {hasPermission('archive') && doc.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(doc._id)}
                            className="text-orange-600 hover:text-orange-900"
                            title="أرشفة"
                          >
                            <FaArchive size={18} />
                          </button>
                        )}
                        {hasPermission('delete') && (
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="text-red-600 hover:text-red-900"
                            title="حذف"
                          >
                            <FaTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-md">
              <div className="text-sm text-gray-700">
                عرض {documents.length} من {pagination.total} كتاب
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2">
                  صفحة {pagination.currentPage} من {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaFileAlt className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-xl text-gray-600">لا توجد كتب</p>
          {hasPermission('create') && (
            <Link
              to="/documents/new"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة كتاب جديد
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Documents;
