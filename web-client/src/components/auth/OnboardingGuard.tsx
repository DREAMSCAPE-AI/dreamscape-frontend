import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useOnboardingStore from '@/store/onboardingStore';
import { useAuth } from '@/services/auth/AuthService';
import { ROUTES, ONBOARDING_EXEMPT_ROUTES } from '@/constants/routes';

interface OnboardingGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({
  children,
  requireOnboarding = true
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const {
    initializeOnboarding,
    getOnboardingStatus,
    isLoading
  } = useOnboardingStore();

  useEffect(() => {
    if (isAuthenticated !== null && isAuthenticated !== undefined) {
      setAuthChecked(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authChecked && isAuthenticated && user) {
      initializeOnboarding();
    }
  }, [authChecked, isAuthenticated, user, initializeOnboarding]);

  const isExemptPath = ONBOARDING_EXEMPT_ROUTES.some(path =>
    location.pathname === path || location.pathname.startsWith(path)
  );

  if (isExemptPath) {
    return <>{children}</>;
  }

  // Show loading state while checking auth or onboarding status
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vérification de votre profil</h2>
          <p className="text-gray-600">Un instant, nous préparons votre expérience...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!requireOnboarding) {
    return <>{children}</>;
  }

  const onboardingStatus = getOnboardingStatus();

  if (onboardingStatus === 'not_started' || onboardingStatus === 'in_progress') {
    return <Navigate to={ROUTES.ONBOARDING} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;