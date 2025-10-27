import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import documentService from '../services/documentService';
import { toast } from 'react-toastify';
import { FaArchive, FaUndo, FaEye, FaFileAlt, FaSearch, FaCalendar } from 'react-icons/fa';

const Archive = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  useEffect(() => {
    fetchArchivedDocuments();
  }, []);

  useEffect(() => {
    const filtered = documents.filter(doc =>
      doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  const fetchArchivedDocuments = async () => {
    try {
      const response = await documentService.getDocuments({ status: 'archived' });
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      toast.error('فشل تحميل الأرشيف');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('هل تريد استعادة هذا الكتاب من الأرشيف؟')) {
      try {
        await documentService.restoreDocument(id);
        toast.success('تم استعادة الكتاب بنجاح');
        fetchArchivedDocuments();
      } catch (error) {
        toast.error('فشل استعادة الكتاب');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Icon */}
      <div className="flex items-center gap-3 mb-6">
        <FaArchive className="text-gray-600 text-3xl" />
        <h1 className="text-3xl font-bold text-gray-800">الأرشيف</h1>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg shadow-md p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-200 mb-1">إجمالي الكتب المؤرشفة</p>
            <p className="text-4xl font-bold">{documents.length}</p>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-full">
            <FaArchive size={32} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث في الأرشيف (رقم الكتاب، العنوان...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <FaSearch className="absolute right-3 top-4 text-gray-400" />
          </div>
        </div>
      )}

      {filteredDocuments.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  تاريخ الأرشفة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-gray-400" />
                      <span className="font-medium text-gray-900">{doc.documentNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    {doc.category && (
                      <div className="text-sm text-gray-500">{doc.category.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.type === 'incoming'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {doc.type === 'incoming' ? 'وارد' : 'صادر'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaCalendar className="text-gray-400 text-sm" />
                      <span className="text-sm">
                        {new Date(doc.archiveDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        to={`/documents/${doc._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض"
                      >
                        <FaEye size={18} />
                      </Link>
                      <button
                        onClick={() => handleRestore(doc._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="استعادة"
                      >
                        <FaUndo size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaArchive className="mx-auto text-gray-400 mb-4" size={64} />
          {searchTerm ? (
            <>
              <p className="text-xl text-gray-600 mb-2">لا توجد نتائج</p>
              <p className="text-gray-500">جرب البحث بكلمات مفتاحية مختلفة</p>
            </>
          ) : (
            <>
              <p className="text-xl text-gray-600 mb-2">لا توجد كتب مؤرشفة</p>
              <p className="text-gray-500">سيتم عرض الكتب المؤرشفة هنا</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Archive;
