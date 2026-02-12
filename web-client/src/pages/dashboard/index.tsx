import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import UserDashboard from '@/components/dashboard/UserDashboard';
import BusinessDashboard from '@/components/business/BusinessDashboard';
import LeisureDashboard from '@/components/leisure/LeisureDashboard';
import BleisureDashboard from '@/components/bleisure/BleisureDashboard';
import { useAuth } from '@/services/auth/AuthService';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Show business dashboard for business users
  if (user?.type === 'business') {
    return (
      <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold">{t('welcome.greeting', { name: user?.name || t('welcome.fallbackName') })}</h1>
            <div className="text-xs md:text-sm text-gray-600">{t('welcome.accountType.business')}</div>
          </div>
          <BusinessDashboard />
        </div>
      </main>
    );
  }

  // Show leisure dashboard for leisure users
  if (user?.type === 'leisure') {
    return (
      <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold">{t('welcome.greeting', { name: user?.name || t('welcome.fallbackName') })}</h1>
            <div className="text-xs md:text-sm text-gray-600">{t('welcome.accountType.leisure')}</div>
          </div>
          <LeisureDashboard />
        </div>
      </main>
    );
  }

  // Show bleisure dashboard for bleisure users
  if (user?.type === 'bleisure') {
    return (
      <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold">{t('welcome.greeting', { name: user?.name || t('welcome.fallbackName') })}</h1>
            <div className="text-xs md:text-sm text-gray-600">{t('welcome.accountType.bleisure')}</div>
          </div>
          <BleisureDashboard />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold">{t('welcome.greeting', { name: user?.name || t('welcome.fallbackName') })}</h1>
          <div className="text-xs md:text-sm text-gray-600">
            {user?.type && t(`welcome.accountType.${user.type}`)}
          </div>
        </div>
        <UserDashboard />
      </div>
    </main>
  );
}