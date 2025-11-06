import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import UserDashboard from '@/components/dashboard/UserDashboard';
import BusinessDashboard from '@/components/business/BusinessDashboard';
import LeisureDashboard from '@/components/leisure/LeisureDashboard';
import BleisureDashboard from '@/components/bleisure/BleisureDashboard';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { useAuth } from '@/services/auth/AuthService';
import { onboardingService } from '@/services/onboarding/onboardingService';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Check if user needs to complete onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await onboardingService.getProgress();

        // Show onboarding if not completed or if there's an error
        if (!response.success || !response.data || response.data.progressPercentage < 100) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.log('Could not check onboarding status, assuming onboarding needed');
        // If backend is not configured or there's an error, show onboarding
        setShowOnboarding(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated]);

  const handleOnboardingComplete = async (preferences: any) => {
    try {
      // Try to save preferences to backend
      const response = await onboardingService.updateStep({
        step: 'preferences',
        data: preferences,
        isCompleted: true
      });

      if (response.success) {
        // Mark onboarding as complete
        await onboardingService.completeOnboarding();
      }
    } catch (error) {
      console.error('Error saving onboarding preferences:', error);
      // Continue anyway - we'll save to localStorage as fallback
    }

    // Close onboarding modal
    setShowOnboarding(false);
  };

  const handleOnboardingCancel = () => {
    // Allow user to skip onboarding for now
    setShowOnboarding(false);
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show business dashboard for business users
  if (user?.type === 'business') {
    return (
      <>
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
              <div className="text-sm text-gray-600">Business Account</div>
            </div>
            <BusinessDashboard />
          </div>
        </main>

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      </>
    );
  }

  // Show leisure dashboard for leisure users
  if (user?.type === 'leisure') {
    return (
      <>
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
              <div className="text-sm text-gray-600">Leisure Account</div>
            </div>
            <LeisureDashboard />
          </div>
        </main>

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      </>
    );
  }

  // Show bleisure dashboard for bleisure users
  if (user?.type === 'bleisure') {
    return (
      <>
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
              <div className="text-sm text-gray-600">Bleisure Account</div>
            </div>
            <BleisureDashboard />
          </div>
        </main>

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      </>
    );
  }

  return (
    <>
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

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
      />
    </>
  );
}