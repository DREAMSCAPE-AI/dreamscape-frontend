// Onboarding Types
export interface OnboardingProfile {
  id: string;
  userId: string;
  currentStep: string;
  completedSteps: string[];
  stepData: Record<string, any>;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string | null;
  lastUpdatedAt: string;
}

export interface OnboardingProgress {
  totalSteps: number;
  completedSteps: string[];
  currentStep: string;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface StepUpdateData {
  step: string;
  data: any;
  markCompleted?: boolean;
}

export interface OnboardingStepData {
  // Step 1: Travel Types
  travel_types?: {
    travelStyle: string[];
  };

  // Step 2: Destinations (Interests)
  destinations?: {
    interests: string[];
  };

  // Step 3: Budget
  budget?: {
    currency: string;
    range: [number, number];
  };

  // Step 4: Transport (Travel Duration)
  transport?: {
    travelDuration: string[];
  };

  // Step 5: Accommodation (Accessibility)
  accommodation?: {
    accessibility: string[];
    sustainability: boolean;
  };
}

export interface CreateOnboardingProfileData {
  currentStep?: string;
  stepData?: OnboardingStepData;
}

// API Response types
export interface OnboardingResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const REQUIRED_STEPS = [
  'destinations',
  'budget',
  'travel_types',
  'accommodation',
  'transport'
] as const;

export type RequiredStep = typeof REQUIRED_STEPS[number];
