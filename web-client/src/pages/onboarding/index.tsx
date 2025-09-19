import React from 'react';
import { Navigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

const OnboardingPage: React.FC = () => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('auth_token');

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