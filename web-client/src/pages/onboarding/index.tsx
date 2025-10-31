import React from 'react';
import { Navigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/services/auth/AuthService';

const OnboardingPage: React.FC = () => {
  // Check if user is authenticated using Zustand store
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="onboarding-page">
      <OnboardingWizard />
    </div>
  );
};

export default OnboardingPage;