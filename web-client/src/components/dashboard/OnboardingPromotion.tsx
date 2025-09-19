import React from 'react';
import OnboardingPrompt from '@/components/onboarding/OnboardingPrompt';
import useOnboardingStore from '@/store/onboardingStore';

const OnboardingPromotion: React.FC = () => {
  const { getOnboardingStatus } = useOnboardingStore();
  const onboardingStatus = getOnboardingStatus();

  // Only show if onboarding is skipped or incomplete
  if (onboardingStatus === 'completed') {
    return null;
  }

  return (
    <div className="mb-6">
      <OnboardingPrompt />
    </div>
  );
};

export default OnboardingPromotion;