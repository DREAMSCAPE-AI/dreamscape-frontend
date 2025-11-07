import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/services/auth/AuthService';
import useOnboardingStore from '@/store/onboardingStore';

const OnboardingPage: React.FC = () => {
  // Check if user is authenticated using Zustand store
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
  if (status === 'completed') {
    console.log('[OnboardingPage] Onboarding status is completed, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="onboarding-page">
      <OnboardingWizard />
    </div>
  );
};

export default OnboardingPage;