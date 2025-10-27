import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import documentService from '../services/documentService';
import categoryService from '../services/categoryService';
import userService from '../services/userService';
import { toast } from 'react-toastify';
import {
  FaFileAlt,
  FaSave,
  FaTimes,
  FaUpload,
  FaCalendar,
  FaEdit,
  FaInfoCircle,
  FaStickyNote,
  FaPaperclip,
  FaFilePdf,
  FaFileWord,
  FaDownload,
  FaUser,
  FaUsers,
  FaPlus,
  FaTrash,
  FaFolderOpen,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaUserCircle,
  FaIdCard
} from 'react-icons/fa';

export const CreateDocument = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    documentNumber: '',
    title: '',
    type: 'incoming',
    priority: 'medium',
    category: '',
    issueDate: '',
    sender: '',
    recipient: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Append files
      selectedFiles.forEach((file) => {
        data.append('scannedImages', file);
      });

      await documentService.createDocument(data);
      toast.success('تم إنشاء الكتاب بنجاح');
      navigate('/documents');
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل إنشاء الكتاب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFileAlt className="text-blue-600 text-2xl" />
          <h1 className="text-3xl font-bold text-gray-800">إنشاء كتاب جديد</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            المعلومات الأساسية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الكتاب
              </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اتركه فارغاً للإنشاء التلقائي"
              />
              <p className="text-xs text-gray-500 mt-1">سيتم إنشاء رقم تلقائي إذا تُرك فارغاً</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الكتاب <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="incoming">وارد</option>
                <option value="outgoing">صادر</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الكتاب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل عنوان الكتاب"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر التصنيف</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأولوية <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
                <option value="urgent">عاجل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendar className="text-gray-500" />
                تاريخ الإصدار <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sender & Receiver Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            معلومات المرسل والمستقبل
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المرسل
              </label>
              <input
                type="text"
                name="sender"
                value={formData.sender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اسم المرسل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستقبل
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اسم المستقبل"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            المحتوى
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموضوع
              </label>
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب موضوع الكتاب..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="وصف إضافي (اختياري)..."
              />
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            المرفقات
          </h2>

          {selectedFiles.length > 0 && (
            <div className="space-y-3 mb-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-blue-600" />
                    <div>
                      <span className="text-gray-700">{file.name}</span>
                      <span className="text-sm text-gray-500 mr-2">
                        ({(file.size / 1024).toFixed(2)} كيلوبايت)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <FaUpload className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 mb-2">اسحب الملفات هنا أو انقر للتحميل</p>
            <input
              type="file"
              multiple
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.tiff"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              اختر الملفات
            </label>
            <p className="text-sm text-gray-500 mt-2">PDF, صور (حتى 10 ميجابايت لكل ملف)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes />
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {loading ? 'جاري الحفظ...' : 'حفظ الكتاب'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const EditDocument = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [formData, setFormData] = useState({
    documentNumber: '',
    title: '',
    type: 'incoming',
    priority: 'medium',
    category: '',
    issueDate: '',
    sender: '',
    receiver: '',
    subject: '',
    notes: '',
  });

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const response = await documentService.getDocument(id);
      const doc = response.data;
      setFormData({
        documentNumber: doc.documentNumber,
        title: doc.title,
        type: doc.type,
        priority: doc.priority,
        category: doc.category?._id || '',
        issueDate: doc.issueDate?.split('T')[0] || '',
        sender: doc.sender,
        receiver: doc.receiver,
        subject: doc.subject,
        notes: doc.notes || '',
      });
      setExistingFiles(doc.scannedImages || []);
    } catch (error) {
      toast.error('فشل تحميل بيانات الكتاب');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveNewFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles(existingFiles.filter(f => f._id !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] && key !== 'documentNumber') {
          data.append(key, formData[key]);
        }
      });

      // Append new files
      selectedFiles.forEach((file) => {
        data.append('scannedImages', file);
      });

      await documentService.updateDocument(id, data);
      toast.success('تم تحديث الكتاب بنجاح');
      navigate(`/documents/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تحديث الكتاب');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFileAlt className="text-green-600 text-2xl" />
          <h1 className="text-3xl font-bold text-gray-800">تعديل الكتاب</h1>
        </div>
        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
          {formData.documentNumber}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            المعلومات الأساسية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الكتاب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">لا يمكن تعديل رقم الكتاب</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الكتاب <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="incoming">وارد</option>
                <option value="outgoing">صادر</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الكتاب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل عنوان الكتاب"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأولوية <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
                <option value="urgent">عاجل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendar className="text-gray-500" />
                تاريخ الإصدار <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sender & Receiver Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            معلومات المرسل والمستقبل
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المرسل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sender"
                value={formData.sender}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اسم المرسل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستقبل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اسم المستقبل"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            المحتوى
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموضوع <span className="text-red-500">*</span>
              </label>
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب موضوع الكتاب..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ملاحظات إضافية (اختياري)..."
              />
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            المرفقات
          </h2>

          {/* Existing Files */}
          {existingFiles.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="text-sm font-medium text-gray-700">الملفات الحالية</h3>
              {existingFiles.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-blue-600" />
                    <div>
                      <span className="text-gray-700">{file.originalName}</span>
                      <span className="text-sm text-gray-500 mr-2">
                        ({(file.size / 1024).toFixed(2)} كيلوبايت)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingFile(file._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="text-sm font-medium text-gray-700">ملفات جديدة</h3>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-green-600" />
                    <div>
                      <span className="text-gray-700">{file.name}</span>
                      <span className="text-sm text-gray-500 mr-2">
                        ({(file.size / 1024).toFixed(2)} كيلوبايت)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <FaUpload className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 mb-2">إضافة مرفقات جديدة</p>
            <input
              type="file"
              multiple
              className="hidden"
              id="file-upload-edit"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.tiff"
            />
            <label
              htmlFor="file-upload-edit"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              اختر الملفات
            </label>
            <p className="text-sm text-gray-500 mt-2">PDF, صور (حتى 10 ميجابايت لكل ملف)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            disabled={submitting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes />
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const DocumentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const response = await documentService.getDocument(id);
      setDocument(response.data);
    } catch (error) {
      toast.error('فشل تحميل بيانات الكتاب');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      await documentService.downloadFile(document._id, file._id, file.originalName);
      toast.success('تم تحميل الملف بنجاح');
    } catch (error) {
      toast.error('فشل تحميل الملف');
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

  const InfoRow = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
      <dd className="text-base text-gray-900">{value}</dd>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-600">الكتاب غير موجود</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaFileAlt className="text-blue-600 text-2xl" />
              <h1 className="text-3xl font-bold text-gray-800">{document.title}</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {document.documentNumber}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                document.type === 'incoming' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {document.type === 'incoming' ? 'وارد' : 'صادر'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(document.priority)}`}>
                {getPriorityText(document.priority)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/documents/${document._id}/edit`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <FaEdit />
              تعديل
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              رجوع
            </button>
          </div>
        </div>
      </div>

      {/* Document Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" />
          معلومات الكتاب
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoRow label="رقم الكتاب" value={document.documentNumber} />
          <InfoRow label="التصنيف" value={document.category?.name || 'غير محدد'} />
          <InfoRow label="تاريخ الإصدار" value={new Date(document.issueDate).toLocaleDateString('ar-EG')} />
          <InfoRow label="الحالة" value={document.status === 'active' ? 'نشط' : 'مؤرشف'} />
          <InfoRow label="المرسل" value={document.sender} />
          <InfoRow label="المستقبل" value={document.receiver} />
          <InfoRow label="تم الإنشاء بواسطة" value={document.createdBy?.fullName || 'غير معروف'} />
          <InfoRow label="تاريخ الإنشاء" value={new Date(document.createdAt).toLocaleString('ar-EG')} />
        </dl>
      </div>

      {/* Subject */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
          <FaFileAlt className="text-blue-600" />
          الموضوع
        </h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{document.subject}</p>
      </div>

      {/* Notes */}
      {document.notes && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
            <FaStickyNote className="text-blue-600" />
            ملاحظات
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{document.notes}</p>
        </div>
      )}

      {/* Attachments */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
          <FaPaperclip className="text-blue-600" />
          المرفقات
        </h2>

        {document.scannedImages && document.scannedImages.length > 0 ? (
          <div className="space-y-3">
            {document.scannedImages.map((file) => {
              const isPdf = file.mimetype === 'application/pdf';
              const isImage = file.mimetype?.startsWith('image/');
              const fileSize = (file.size / 1024).toFixed(2);
              const fileSizeUnit = file.size < 1024 * 1024 ? 'كيلوبايت' : 'ميجابايت';
              const displaySize = file.size < 1024 * 1024
                ? fileSize
                : (file.size / (1024 * 1024)).toFixed(2);

              return (
                <div key={file._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {isPdf ? (
                      <FaFilePdf className="text-red-600 text-2xl" />
                    ) : isImage ? (
                      <FaFileAlt className="text-blue-600 text-2xl" />
                    ) : (
                      <FaFileAlt className="text-gray-600 text-2xl" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{file.originalName}</p>
                      <p className="text-sm text-gray-500">{displaySize} {fileSizeUnit}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <FaDownload />
                    تحميل
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">لا توجد مرفقات لهذا الكتاب</p>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>آخر تعديل: {new Date(document.updatedAt).toLocaleString('ar-EG')}</span>
          <span>تم الإنشاء: {new Date(document.createdAt).toLocaleString('ar-EG')}</span>
        </div>
      </div>
    </div>
  );
};

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('فشل تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryService.createCategory(formData);
      toast.success('تم إضافة التصنيف بنجاح');
      setShowModal(false);
      setFormData({ name: '', description: '' });
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل إضافة التصنيف');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('تم حذف التصنيف بنجاح');
        loadCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل حذف التصنيف');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFolderOpen className="text-blue-600 text-2xl" />
          <h1 className="text-3xl font-bold text-gray-800">إدارة التصنيفات</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          تصنيف جديد
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaFolderOpen className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.documentCount || 0} كتاب</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{category.description}</p>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors">
                  <FaEdit />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaFolderOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-xl text-gray-600 mb-4">لا توجد تصنيفات</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة تصنيف جديد
          </button>
        </div>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">إضافة تصنيف جديد</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم التصنيف <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: إداري"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف التصنيف..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'data_entry',
    password: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(formData);
      toast.success('تم إضافة المستخدم بنجاح');
      setShowModal(false);
      setFormData({ username: '', fullName: '', email: '', role: 'data_entry', password: '' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل إضافة المستخدم');
    }
  };

  const getRoleName = (role) => {
    const roles = {
      admin: 'مدير النظام',
      data_entry: 'مدخل بيانات',
      archivist: 'مؤرشف',
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      data_entry: 'bg-blue-100 text-blue-800',
      archivist: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const toggleUserStatus = async (id) => {
    try {
      await userService.toggleActive(id);
      toast.success('تم تحديث حالة المستخدم بنجاح');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تحديث حالة المستخدم');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-blue-600 text-2xl" />
          <h1 className="text-3xl font-bold text-gray-800">إدارة المستخدمين</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          مستخدم جديد
        </button>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المستخدم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                البريد الإلكتروني
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الصلاحية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                تاريخ الإنشاء
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleUserStatus(user._id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.isActive ? 'نشط' : 'معطل'}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-green-600 hover:text-green-900">
                      <FaEdit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash size={18} />
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
          <FaUsers className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-xl text-gray-600 mb-4">لا يوجد مستخدمين</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة مستخدم جديد
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">إضافة مستخدم جديد</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصلاحية <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="data_entry">مدخل بيانات</option>
                  <option value="archivist">مؤرشف</option>
                  <option value="admin">مدير النظام</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ username: '', fullName: '', email: '', role: 'data_entry', password: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.data;
      setFormData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('فشل تحميل بيانات الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords if provided
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('يرجى إدخال كلمة المرور الحالية');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('كلمة المرور الجديدة غير متطابقة');
        return;
      }
    }

    try {
      // Update profile details
      const profileData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };
      await authService.updateProfile(profileData);

      // Update password if provided
      if (formData.newPassword) {
        await authService.updatePassword(formData.currentPassword, formData.newPassword);
      }

      // Update user in localStorage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('تم تحديث الملف الشخصي بنجاح');
      setIsEditing(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Reload profile data to sync
      loadProfileData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تحديث الملف الشخصي');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <FaUserCircle className="text-blue-600 text-3xl" />
        <h1 className="text-3xl font-bold text-gray-800">الملف الشخصي</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaUserCircle className="text-white text-8xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{formData.fullName}</h2>
            <p className="text-gray-600 mb-4">@{formData.username}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <FaEnvelope className="text-blue-600" />
                <span className="text-sm">{formData.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <FaPhone className="text-blue-600" />
                <span className="text-sm">{formData.phone}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'data_entry' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role === 'admin' ? 'مدير النظام' :
                 user?.role === 'data_entry' ? 'مدخل بيانات' : 'مؤرشف'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  المعلومات الشخصية
                </h2>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <FaEdit />
                    تعديل
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">لا يمكن تعديل اسم المستخدم</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                  <FaLock className="text-blue-600" />
                  تغيير كلمة المرور
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور الحالية
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <FaTimes />
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <FaSave />
                  حفظ التغييرات
                </button>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};