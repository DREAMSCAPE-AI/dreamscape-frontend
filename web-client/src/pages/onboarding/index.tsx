import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/services/auth/AuthService';
import useOnboardingStore from '@/store/onboardingStore';
import HeroSection from '@/components/hero/HeroSection';
import FeaturedExperiences from '@/components/features/FeaturedExperiences';
import PersonalizationShowcase from '@/components/features/PersonalizationShowcase';
import DestinationCategories from '@/components/categories/DestinationCategories';
import SocialProof from '@/components/testimonials/SocialProof';

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
    <div className="relative min-h-screen">
      {/* Background homepage content */}
      <div className="absolute inset-0">
        <main>
          <HeroSection />
          <FeaturedExperiences />
          <PersonalizationShowcase />
          <DestinationCategories />
          <SocialProof />
        </main>
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