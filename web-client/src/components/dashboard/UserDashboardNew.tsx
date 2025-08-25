import React from 'react';
import { useAuth } from '../../services/auth/AuthService';
import UnifiedDashboard from './UnifiedDashboard';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Please log in to view your dashboard</h2>
          <p className="text-gray-600">Access your personalized travel dashboard by logging in.</p>
        </div>
      </div>
    );
  }

  return <UnifiedDashboard userCategory={user?.userCategory} />;
};

export default UserDashboard;
