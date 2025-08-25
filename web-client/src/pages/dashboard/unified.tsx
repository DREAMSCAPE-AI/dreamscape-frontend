import React from 'react';
import { Navigate } from 'react-router-dom';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useAuth } from '@/services/auth/AuthService';

export default function UnifiedDashboardPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <UnifiedDashboard userCategory={user?.userCategory} />;
}
