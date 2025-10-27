import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredPermission, requiredRole }) => {
  const { user, loading, hasPermission, isRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">
          ليس لديك الصلاحية للوصول إلى هذه الصفحة
        </div>
      </div>
    );
  }

  if (requiredRole && !isRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">
          ليس لديك الصلاحية للوصول إلى هذه الصفحة
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
