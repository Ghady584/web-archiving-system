import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import {
  FaHome,
  FaFileAlt,
  FaArchive,
  FaFolderOpen,
  FaUsers,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationService.getNotifications({ unreadOnly: true, limit: 5 });
      setNotificationCount(response.unreadCount);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FaHome, label: 'الرئيسية', roles: ['admin', 'data_entry', 'archivist'] },
    { path: '/documents', icon: FaFileAlt, label: 'الكتب', roles: ['admin', 'data_entry', 'archivist'] },
    { path: '/archive', icon: FaArchive, label: 'الأرشيف', roles: ['admin', 'archivist'] },
    { path: '/categories', icon: FaFolderOpen, label: 'التصنيفات', roles: ['admin'] },
    { path: '/users', icon: FaUsers, label: 'المستخدمين', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              نظام الأرشفة الإلكتروني
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-600 hover:text-gray-900"
              >
                <FaBell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b">
                    <h3 className="font-semibold">الإشعارات</h3>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className="px-4 py-3 hover:bg-gray-50 border-b cursor-pointer"
                        onClick={() => {
                          setShowNotifications(false);
                          if (notif.relatedDocument) {
                            navigate(`/documents/${notif.relatedDocument._id}`);
                          }
                        }}
                      >
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-gray-500">
                      لا توجد إشعارات جديدة
                    </div>
                  )}
                  <div className="px-4 py-2 border-t">
                    <Link
                      to="/notifications"
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setShowNotifications(false)}
                    >
                      عرض جميع الإشعارات
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' && 'مدير'}
                  {user?.role === 'data_entry' && 'مدخل بيانات'}
                  {user?.role === 'archivist' && 'مؤرشف'}
                </p>
              </div>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900"
              >
                <FaUser size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                <FaSignOutAlt size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white shadow-lg fixed h-full transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarOpen ? 'mr-64' : 'mr-0'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
