import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/services/auth/AuthService';
import useOnboardingStore from '@/store/onboardingStore';
import UserDashboard from '@/components/dashboard/UserDashboard';
import BusinessDashboard from '@/components/business/BusinessDashboard';
import LeisureDashboard from '@/components/leisure/LeisureDashboard';
import BleisureDashboard from '@/components/bleisure/BleisureDashboard';

const OnboardingPage: React.FC = () => {
  const { t } = useTranslation('onboarding');
  const { isAuthenticated, user } = useAuth();
  const { initializeOnboarding, getOnboardingStatus } = useOnboardingStore();

  // Initialize onboarding data when page loads
  useEffect(() => {
    if (isAuthenticated) {
      initializeOnboarding();
    }
  }, [isAuthenticated, initializeOnboarding]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // CRITICAL: If user has already completed onboarding, redirect to dashboard
  // This prevents users from accessing onboarding page after completion
  if (user?.onboardingCompleted === true) {
    console.log('[OnboardingPage] User has already completed onboarding, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const status = getOnboardingStatus();
  if (status === 'completed' || status === 'skipped') {
    console.log('[OnboardingPage] Onboarding status is completed/skipped, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Render the appropriate dashboard component based on user type
  const renderDashboard = () => {
    if (user?.type === 'business') {
      return (
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{t('welcome', { name: user?.name })}</h1>
              <div className="text-sm text-gray-600">{t('businessAccount')}</div>
            </div>
            <BusinessDashboard />
          </div>
        </main>
      );
    }

    if (user?.type === 'leisure') {
      return (
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{t('welcome', { name: user?.name })}</h1>
              <div className="text-sm text-gray-600">{t('leisureAccount')}</div>
            </div>
            <LeisureDashboard />
          </div>
        </main>
      );
    }

    if (user?.type === 'bleisure') {
      return (
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{t('welcome', { name: user?.name })}</h1>
              <div className="text-sm text-gray-600">{t('bleisureAccount')}</div>
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
            <h1 className="text-2xl font-bold">{t('welcome', { name: user?.name })}</h1>
            <div className="text-sm text-gray-600">
              {user?.type && t('accountType', { type: user.type.charAt(0).toUpperCase() + user.type.slice(1) })}
            </div>
          </div>
          <UserDashboard />
        </div>
      </main>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Background dashboard content */}
      <div className="absolute inset-0">
        {renderDashboard()}
      </div>

      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Onboarding modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-4xl my-8">
          <OnboardingWizard />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
