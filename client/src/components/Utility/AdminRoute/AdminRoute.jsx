import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  // 1. Wait for the fetcher to complete
  if (loading) {
    return <div className="spinner"></div>; // Or a dedicated loading component
  }

  // 2. Evaluate authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Evaluate authorization
  if (user.role === 'Manager' || user.role === 'Admin') {
    return <Outlet />;
  }

  return <Navigate to="/employee-dashboard" replace />;
};

export default AdminRoute;
