import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { onboardingService } from '@/services/onboardingService';
import type {
  TravelOnboardingProfile,
  OnboardingProgressResponse,
  ONBOARDING_STEPS,
  OnboardingStep
} from '@/types/onboarding';
import { ONBOARDING_STEPS } from '@/types/onboarding';

interface OnboardingState {
  // State
  profile: TravelOnboardingProfile;
  progress: OnboardingProgressResponse | null;
  currentStepIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  isSkipped: boolean;

  // Computed selectors
  getCurrentStep: () => OnboardingStep;
  getIsFirstStep: () => boolean;
  getIsLastStep: () => boolean;
  getCanProceed: () => boolean;
  getCompletionPercentage: () => number;

  // Actions
  initializeOnboarding: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<TravelOnboardingProfile>) => void;
  saveCurrentStep: () => Promise<void>;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  skipStep: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  skipOnboarding: () => void;
  clearError: () => void;
  getStepData: (stepId: string) => Partial<TravelOnboardingProfile>;
  getOnboardingStatus: () => 'not_started' | 'in_progress' | 'completed' | 'skipped';
}

const useOnboardingStore = create<OnboardingState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        profile: {},
        progress: null,
        currentStepIndex: 0,
        isLoading: false,
        isSaving: false,
        error: null,
        hasUnsavedChanges: false,
        isSkipped: false,

        // Computed selectors
        getCurrentStep: () => {
          const state = get();
          return ONBOARDING_STEPS[state.currentStepIndex] || ONBOARDING_STEPS[0];
        },

        getIsFirstStep: () => {
          const state = get();
          return state.currentStepIndex === 0;
        },

        getIsLastStep: () => {
          const state = get();
          return state.currentStepIndex === ONBOARDING_STEPS.length - 1;
        },

        getCanProceed: () => {
          const state = get();
          const currentStep = state.getCurrentStep();
          const { profile } = state;

          // Allow proceeding if step is not required or has data
          if (!currentStep.required) return true;

          // Check if current step has required data
          switch (currentStep.id) {
            case 'destinations':
              return !!profile.preferredDestinations;
            case 'budget':
              return !!profile.globalBudgetRange && !!profile.budgetFlexibility;
            case 'travel-types':
              return profile.travelTypes && profile.travelTypes.length > 0;
            case 'style-comfort':
              return !!profile.travelStyle && !!profile.comfortLevel;
            case 'review':
              return true; // Always allow on review step
            default:
              return true;
          }
        },

        getCompletionPercentage: () => {
          const state = get();
          return state.progress?.progressPercentage || 0;
        },

        // Actions
        async initializeOnboarding() {
          set({ isLoading: true, error: null });

          try {
            // Try to load existing profile first
            await get().loadProfile();

            // If no profile exists, create one
            const { progress } = get();
            if (!progress) {
              try {
                await onboardingService.initializeProfile();
                await get().loadProfile();
              } catch (initError: any) {
                // If profile already exists (409), just reload to get the existing one
                if (initError?.response?.status === 409) {
                  console.log('Onboarding profile already exists, loading existing profile');
                  await get().loadProfile();
                } else {
                  // Re-throw other errors
                  throw initError;
                }
              }
            }
          } catch (error) {
            console.error('Failed to initialize onboarding:', error);
            set({ error: error instanceof Error ? error.message : 'Erreur d\'initialisation' });
          } finally {
            set({ isLoading: false });
          }
        },

        async loadProfile() {
          set({ isLoading: true, error: null });

          try {
            const [profile, progress] = await Promise.all([
              onboardingService.getCurrentProfile(),
              onboardingService.getProgress()
            ]);

            // Determine current step based on progress
            let currentStepIndex = 0;
            if (progress && progress.completedSteps && progress.completedSteps.length > 0) {
              // Find the first incomplete step
              currentStepIndex = ONBOARDING_STEPS.findIndex(
                step => !progress.completedSteps.includes(step.id)
              );

              // If all steps completed, go to review step
              if (currentStepIndex === -1) {
                currentStepIndex = ONBOARDING_STEPS.length - 1;
              }
            }

            set({
              profile: profile || {},
              progress,
              currentStepIndex,
              hasUnsavedChanges: false
            });
          } catch (error) {
            console.error('Failed to load profile:', error);
            set({ error: error instanceof Error ? error.message : 'Erreur de chargement' });
          } finally {
            set({ isLoading: false });
          }
        },

        updateProfile(updates: Partial<TravelOnboardingProfile>) {
          set(state => ({
            profile: { ...state.profile, ...updates },
            hasUnsavedChanges: true,
            error: null
          }));
        },

        async saveCurrentStep() {
          const state = get();
          const { isSaving } = state;
          const currentStep = state.getCurrentStep();

          if (isSaving) return;

          set({ isSaving: true, error: null });

          try {
            // Extract data relevant to current step
            const stepData = get().getStepData(currentStep.id);

            await onboardingService.saveStep({
              step: currentStep.id,
              data: stepData,
              isCompleted: get().getCanProceed()
            });

            // Reload progress to get updated state
            const progress = await onboardingService.getProgress();

            set({
              progress,
              hasUnsavedChanges: false
            });
          } catch (error) {
            console.error('Failed to save step:', error);
            set({ error: error instanceof Error ? error.message : 'Erreur de sauvegarde' });
          } finally {
            set({ isSaving: false });
          }
        },

        async nextStep() {
          const state = get();
          const { currentStepIndex } = state;
          const canProceed = state.getCanProceed();
          const isLastStep = state.getIsLastStep();

          if (!canProceed) {
            set({ error: 'Veuillez compléter les champs requis avant de continuer.' });
            return;
          }

          // Save current step before proceeding
          await get().saveCurrentStep();

          if (!isLastStep) {
            set({ currentStepIndex: currentStepIndex + 1 });
          }
        },

        previousStep() {
          const state = get();
          const { currentStepIndex } = state;
          const isFirstStep = state.getIsFirstStep();

          if (!isFirstStep) {
            set({
              currentStepIndex: currentStepIndex - 1,
              error: null
            });
          }
        },

        goToStep(stepIndex: number) {
          if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
            set({
              currentStepIndex: stepIndex,
              error: null
            });
          }
        },

        async skipStep() {
          const state = get();
          const { currentStepIndex } = state;
          const currentStep = state.getCurrentStep();

          if (!currentStep.required) {
            await get().saveCurrentStep();
            set({ currentStepIndex: currentStepIndex + 1 });
          }
        },

        async completeOnboarding() {
          set({ isSaving: true, error: null });

          try {
            // Save current step first
            await get().saveCurrentStep();

            // Complete the onboarding
            await onboardingService.completeOnboarding();

            // Reload to get final state
            await get().loadProfile();

            // Navigate to success or redirect
            // This could trigger a navigation event
          } catch (error) {
            console.error('Failed to complete onboarding:', error);
            set({ error: error instanceof Error ? error.message : 'Erreur de finalisation' });
          } finally {
            set({ isSaving: false });
          }
        },

        async resetOnboarding() {
          set({ isLoading: true, error: null });

          try {
            await onboardingService.resetProfile();

            // Reset local state
            set({
              profile: {},
              progress: null,
              currentStepIndex: 0,
              hasUnsavedChanges: false
            });

            // Reinitialize
            await get().initializeOnboarding();
          } catch (error) {
            console.error('Failed to reset onboarding:', error);
            set({ error: error instanceof Error ? error.message : 'Erreur de réinitialisation' });
          } finally {
            set({ isLoading: false });
          }
        },

        clearError() {
          set({ error: null });
        },

        skipOnboarding() {
          set({
            isSkipped: true,
            hasUnsavedChanges: false
          });
        },

        getOnboardingStatus() {
          const state = get();

          if (state.isSkipped) return 'skipped';
          if (state.progress?.progressPercentage === 100) return 'completed';
          if (state.progress && state.progress.completedSteps.length > 0) return 'in_progress';
          return 'not_started';
        },

        // Helper method to extract step-specific data
        getStepData(stepId: string): Partial<TravelOnboardingProfile> {
          const { profile } = get();

          switch (stepId) {
            case 'destinations':
              return { preferredDestinations: profile.preferredDestinations };
            case 'budget':
              return {
                globalBudgetRange: profile.globalBudgetRange,
                budgetFlexibility: profile.budgetFlexibility
              };
            case 'travel-types':
              return { travelTypes: profile.travelTypes };
            case 'style-comfort':
              return {
                travelStyle: profile.travelStyle,
                comfortLevel: profile.comfortLevel
              };
            case 'accommodation':
              return {
                accommodationTypes: profile.accommodationTypes,
                accommodationBudgetRange: profile.accommodationBudgetRange
              };
            case 'transport':
              return {
                preferredAirlines: profile.preferredAirlines,
                cabinClassPreferences: profile.cabinClassPreferences
              };
            case 'activities':
              return {
                preferredActivities: profile.preferredActivities,
                activityLevel: profile.activityLevel
              };
            case 'travel-groups':
              return {
                travelGroupTypes: profile.travelGroupTypes,
                groupSizePreference: profile.groupSizePreference
              };
            case 'constraints':
              return {
                dietaryRestrictions: profile.dietaryRestrictions,
                accessibilityNeeds: profile.accessibilityNeeds
              };
            case 'timing':
              return {
                seasonalPreferences: profile.seasonalPreferences,
                dateFlexibility: profile.dateFlexibility
              };
            case 'duration':
              return {
                typicalTripDuration: profile.typicalTripDuration,
                preferredDuration: profile.preferredDuration
              };
            case 'experience':
              return {
                travelExperienceLevel: profile.travelExperienceLevel,
                riskTolerance: profile.riskTolerance
              };
            default:
              return {};
          }
        }
      }),
      {
        name: 'dreamscape-onboarding',
        partialize: (state) => ({
          profile: state.profile,
          currentStepIndex: state.currentStepIndex,
          hasUnsavedChanges: state.hasUnsavedChanges
        })
      }
    ),
    { name: 'onboarding-store' }
  )
);

export default useOnboardingStore;