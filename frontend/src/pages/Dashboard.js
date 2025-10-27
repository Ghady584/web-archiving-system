import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/documentService';
import {
  FaFileAlt,
  FaArchive,
  FaInbox,
  FaPaperPlane,
  FaExclamationTriangle,
  FaPlus,
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await documentService.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  const getStatusCount = (status) => {
    const item = stats?.byStatus?.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const getTypeCount = (type) => {
    const item = stats?.byType?.find(t => t._id === type);
    return item ? item.count : 0;
  };

  const getPriorityCount = (priority) => {
    const item = stats?.byPriority?.find(p => p._id === priority);
    return item ? item.count : 0;
  };

  const totalDocuments = stats?.total?.[0]?.count || 0;

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link
      to={link}
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color.replace('hover:', '')}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Link>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            مرحباً، {user?.fullName}
          </h1>
          <p className="text-gray-600 mt-1">نظرة عامة على النظام</p>
        </div>
        {user?.role !== 'archivist' && (
          <Link
            to="/documents/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            كتاب جديد
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي الكتب"
          value={totalDocuments}
          icon={FaFileAlt}
          color="bg-blue-500 hover:bg-blue-600"
          link="/documents"
        />
        <StatCard
          title="الكتب الواردة"
          value={getTypeCount('incoming')}
          icon={FaInbox}
          color="bg-green-500 hover:bg-green-600"
          link="/documents?type=incoming"
        />
        <StatCard
          title="الكتب الصادرة"
          value={getTypeCount('outgoing')}
          icon={FaPaperPlane}
          color="bg-purple-500 hover:bg-purple-600"
          link="/documents?type=outgoing"
        />
        <StatCard
          title="الكتب المؤرشفة"
          value={getStatusCount('archived')}
          icon={FaArchive}
          color="bg-gray-500 hover:bg-gray-600"
          link="/archive"
        />
      </div>

      {/* Priority Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          حالة الأولوية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <FaExclamationTriangle className="text-red-500 mx-auto mb-2" size={24} />
            <p className="text-gray-600 text-sm">عاجل</p>
            <p className="text-2xl font-bold text-red-600">{getPriorityCount('urgent')}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <FaExclamationTriangle className="text-orange-500 mx-auto mb-2" size={24} />
            <p className="text-gray-600 text-sm">عالي</p>
            <p className="text-2xl font-bold text-orange-600">{getPriorityCount('high')}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <FaExclamationTriangle className="text-yellow-500 mx-auto mb-2" size={24} />
            <p className="text-gray-600 text-sm">متوسط</p>
            <p className="text-2xl font-bold text-yellow-600">{getPriorityCount('medium')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FaExclamationTriangle className="text-green-500 mx-auto mb-2" size={24} />
            <p className="text-gray-600 text-sm">منخفض</p>
            <p className="text-2xl font-bold text-green-600">{getPriorityCount('low')}</p>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          آخر الكتب المضافة
        </h2>
        {stats?.recentDocuments && stats.recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {stats.recentDocuments.map((doc) => (
              <Link
                key={doc._id}
                to={`/documents/${doc._id}`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{doc.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      رقم الكتاب: {doc.documentNumber}
                    </p>
                  </div>
                  <div className="text-left">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.type === 'incoming'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {doc.type === 'incoming' ? 'وارد' : 'صادر'}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(doc.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            لا توجد كتب حتى الآن
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
