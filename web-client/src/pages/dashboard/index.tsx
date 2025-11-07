import React from 'react';
import { Navigate } from 'react-router-dom';
import UserDashboard from '@/components/dashboard/UserDashboard';
import BusinessDashboard from '@/components/business/BusinessDashboard';
import LeisureDashboard from '@/components/leisure/LeisureDashboard';
import BleisureDashboard from '@/components/bleisure/BleisureDashboard';
import { useAuth } from '@/services/auth/AuthService';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Show business dashboard for business users
  if (user?.type === 'business') {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
            <div className="text-sm text-gray-600">Business Account</div>
          </div>
          <BusinessDashboard />
        </div>
      </main>
    );
  }

  // Show leisure dashboard for leisure users
  if (user?.type === 'leisure') {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
            <div className="text-sm text-gray-600">Leisure Account</div>
          </div>
          <LeisureDashboard />
        </div>
      </main>
    );
  }

  // Show bleisure dashboard for bleisure users
  if (user?.type === 'bleisure') {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
            <div className="text-sm text-gray-600">Bleisure Account</div>
          </div>
          <BleisureDashboard />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <div className="text-sm text-gray-600">
            {user?.type && `${user.type.charAt(0).toUpperCase() + user.type.slice(1)} Account`}
          </div>
        </div>
        <UserDashboard />
      </div>
    </main>
  );
}