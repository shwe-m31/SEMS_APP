import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleDashboardMap = {
      'OWNER': '/owner-dashboard',
      'ADMIN': '/admin-dashboard',
      'WORKER': '/worker-dashboard'
    };
    return <Navigate to={roleDashboardMap[user.role] || '/'} />;
  }

  return children;
};

export default ProtectedRoute;
