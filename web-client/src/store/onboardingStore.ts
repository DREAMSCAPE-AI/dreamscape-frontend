import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { onboardingService } from '@/services/onboarding/onboardingService';
import type {
  TravelOnboardingProfile,
  OnboardingProgressResponse,
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
            case 'travel_types':
              return profile.travelTypes && profile.travelTypes.length > 0;
            case 'style_comfort':
              return !!profile.travelStyle && !!profile.comfortLevel;
            case 'accommodation':
              return profile.accommodationTypes && profile.accommodationTypes.length > 0 && !!profile.accommodationLevel;
            case 'transport':
              return profile.transportModes && profile.transportModes.length > 0 && !!profile.cabinClassPreference;
            case 'activities':
              return !!profile.activityLevel; // Activity types are optional, level is required
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
              const response = await onboardingService.createProfile();
              if (response.success) {
                await get().loadProfile();
              } else {
                throw new Error(response.error || 'Erreur d\'initialisation');
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
            const [profileResponse, progressResponse] = await Promise.all([
              onboardingService.getProfile(),
              onboardingService.getProgress()
            ]);

            // Handle potential errors from the new service
            if (!profileResponse.success && !progressResponse.success) {
              throw new Error(profileResponse.error || progressResponse.error || 'Erreur de chargement');
            }

            const profile = profileResponse.data?.stepData || {};
            const progress = progressResponse.data;

            console.log('[OnboardingStore] Loaded from backend:', {
              profileComplete: profileResponse.data?.isCompleted,
              progressPercentage: progress?.progressPercentage,
              completedSteps: progress?.completedSteps
            });

            // CRITICAL: If backend says onboarding is complete, sync with auth store
            if (progress?.progressPercentage === 100 || profileResponse.data?.isCompleted) {
              console.log('[OnboardingStore] Backend says onboarding is COMPLETE, syncing to auth store');

              // Update the auth store to mark onboarding as completed
              try {
                const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
                if (authStorage.state?.user) {
                  authStorage.state.user.onboardingCompleted = true;
                  authStorage.state.user.onboardingCompletedAt = new Date().toISOString();
                  localStorage.setItem('auth-storage', JSON.stringify(authStorage));
                  console.log('[OnboardingStore] ✓ Updated user.onboardingCompleted = true in localStorage');
                }
              } catch (error) {
                console.error('[OnboardingStore] Failed to update auth storage:', error);
              }
            }

            // Determine current step based on progress
            let currentStepIndex = 0;
            if (progress?.completedSteps && progress.completedSteps.length > 0) {
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
              progress: progress ? {
                totalSteps: progress.totalSteps,
                completedSteps: progress.completedSteps,
                currentStep: progress.currentStep,
                progressPercentage: progress.progressPercentage
              } : null,
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

            const response = await onboardingService.updateStep({
              step: currentStep.id,
              data: stepData,
              markCompleted: true  // Always mark as completed when saving
            });

            if (!response.success) {
              throw new Error(response.error || 'Erreur de sauvegarde');
            }

            // Reload progress to get updated state
            const progressResponse = await onboardingService.getProgress();

            set({
              progress: progressResponse.data ? {
                totalSteps: progressResponse.data.totalSteps,
                completedSteps: progressResponse.data.completedSteps,
                currentStep: progressResponse.data.currentStep,
                progressPercentage: progressResponse.data.progressPercentage
              } : null,
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

            // Add a small delay to avoid rate limiting (429)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Complete the onboarding
            const response = await onboardingService.completeOnboarding();

            if (!response.success) {
              throw new Error(response.error || 'Erreur de finalisation');
            }

            // Mark as completed locally
            set({
              profile: { ...get().profile, isComplete: true },
              progress: { ...get().progress, progressPercentage: 100 } as any
            });

            // Navigation will be handled by the component
            return true;
          } catch (error: any) {
            console.error('Failed to complete onboarding:', error);

            // Handle specific error cases
            let errorMessage = 'Erreur de finalisation';
            if (error?.response?.status === 429) {
              errorMessage = 'Trop de requêtes. Veuillez patienter quelques secondes avant de réessayer.';
            } else if (error?.response?.status >= 500) {
              errorMessage = 'Erreur serveur. Veuillez réessayer dans quelques instants.';
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }

            set({ error: errorMessage });
            return false;
          } finally {
            set({ isSaving: false });
          }
        },

        async resetOnboarding() {
          set({ isLoading: true, error: null });

          try {
            const response = await onboardingService.resetProfile();

            if (!response.success) {
              throw new Error(response.error || 'Erreur de réinitialisation');
            }

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

          // Check localStorage first - if user completed onboarding, trust that
          try {
            const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            if (authStorage.state?.user?.onboardingCompleted === true) {
              console.log('[OnboardingStatus] User has onboardingCompleted flag in localStorage');
              return 'completed';
            }
          } catch (error) {
            console.error('Failed to check auth storage for onboarding status:', error);
          }

          // Check both profile.isComplete and progressPercentage
          if (state.profile?.isComplete) {
            console.log('[OnboardingStatus] Profile is marked as complete');
            return 'completed';
          }

          if (state.progress?.progressPercentage === 100) {
            console.log('[OnboardingStatus] Progress is 100%');
            return 'completed';
          }

          if (state.progress?.completedSteps && state.progress.completedSteps.length > 0) {
            console.log('[OnboardingStatus] In progress -', state.progress.completedSteps.length, 'steps completed');
            return 'in_progress';
          }

          console.log('[OnboardingStatus] Not started');
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
            case 'travel_types':
              return { travelTypes: profile.travelTypes };
            case 'style_comfort':
              return {
                travelStyle: profile.travelStyle,
                comfortLevel: profile.comfortLevel
              };
            case 'accommodation':
              return {
                accommodationTypes: profile.accommodationTypes,
                accommodationLevel: profile.accommodationLevel
              };
            case 'transport':
              return {
                transportModes: profile.transportModes,
                cabinClassPreference: profile.cabinClassPreference
              };
            case 'activities':
              return {
                activityTypes: profile.activityTypes,
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