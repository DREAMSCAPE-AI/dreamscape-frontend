import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useOnboardingStore from '@/store/onboardingStore';
import { useAuth } from '@/services/auth/AuthService';

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

  // Check if auth is stable before proceeding
  useEffect(() => {
    // Small delay to ensure auth state is stable
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Initialize onboarding data only after auth is checked and user is authenticated
  useEffect(() => {
    if (authChecked && isAuthenticated) {
      initializeOnboarding();
    }
  }, [authChecked, isAuthenticated, initializeOnboarding]);

  // Don't block if we're already on onboarding pages or auth pages
  const exemptPaths = ['/onboarding', '/auth', '/settings-demo'];
  const isExemptPath = exemptPaths.some(path => location.pathname.startsWith(path));

  if (isExemptPath) {
    return <>{children}</>;
  }

  // Show loading state while checking onboarding status
  if (isLoading) {
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

  if (!requireOnboarding) {
    return <>{children}</>;
  }

  const onboardingStatus = getOnboardingStatus();

  // Redirect to onboarding if not completed and not skipped
  if (onboardingStatus === 'not_started' || onboardingStatus === 'skipped') {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  // Allow access to the protected content
  return <>{children}</>;
};

export default OnboardingGuard;