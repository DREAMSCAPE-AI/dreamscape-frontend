import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Check, AlertCircle, Loader2, X, ArrowRight } from 'lucide-react';
import { ONBOARDING_STEPS } from '@/types/onboarding';
import useOnboardingStore from '@/store/onboardingStore';
import { useAuth } from '@/services/auth/AuthService';
import ProgressIndicator from './ProgressIndicator';

// Import step components
import DestinationsStep from './steps/DestinationsStep';
import BudgetStep from './steps/BudgetStep';
import TravelTypesStep from './steps/TravelTypesStep';
import StyleComfortStep from './steps/StyleComfortStep';
import AccommodationStep from './steps/AccommodationStep';
import TransportStep from './steps/TransportStep';
import ActivitiesStep from './steps/ActivitiesStep';

// Placeholder components for remaining steps
const PlaceholderStep: React.FC<{ stepId: string; title: string; icon: string; t: any }> = ({ stepId, title, icon, t }) => (
  <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-600 mb-6">{t('wizard.stepInDevelopment')}</p>
    <div className="bg-orange-50 rounded-lg p-4">
      <p className="text-sm text-orange-800">
        {t('wizard.stepId')}: <code className="font-mono bg-orange-100 px-2 py-1 rounded">{stepId}</code>
      </p>
    </div>
  </div>
);

const OnboardingWizard: React.FC = () => {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  const {
    currentStepIndex,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    progress,
    getCurrentStep,
    getIsFirstStep,
    getIsLastStep,
    getCanProceed,
    getAllRequiredStepsCompleted,
    initializeOnboarding,
    nextStep,
    previousStep,
    goToStep,
    skipStep,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
    clearError
  } = useOnboardingStore();

  const currentStep = getCurrentStep();
  const isFirstStep = getIsFirstStep();
  const isLastStep = getIsLastStep();
  const canProceed = getCanProceed();
  const allRequiredStepsCompleted = getAllRequiredStepsCompleted();

  // Initialize onboarding on mount
  useEffect(() => {
    initializeOnboarding();
  }, [initializeOnboarding]);

  // Handle skip entire onboarding
  const handleSkipOnboarding = () => {
    if (confirm(t('wizard.confirmSkip'))) {
      skipOnboarding();
      // Update user in auth store to mark onboarding as completed (skipped counts as completed)
      updateUser({
        onboardingCompleted: true
      });
      // Redirect to the page they were trying to access or dashboard
      const returnPath = (location.state as any)?.from || '/dashboard';
      navigate(returnPath, { replace: true });
    }
  };

  // Handle complete onboarding
  const handleCompleteOnboarding = async () => {
    const success = await completeOnboarding();
    if (success) {
      // Update user in auth store to mark onboarding as completed
      updateUser({
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString()
      });

      // Small delay to ensure state is persisted
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to dashboard after successful completion
      const returnPath = (location.state as any)?.from || '/dashboard';
      navigate(returnPath, { replace: true });
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'destinations':
        return <DestinationsStep />;
      case 'budget':
        return <BudgetStep />;
      case 'travel_types':
        return <TravelTypesStep />;
      case 'style_comfort':
        return <StyleComfortStep />;
      case 'accommodation':
        return <AccommodationStep />;
      case 'transport':
        return <TransportStep />;
      case 'activities':
        return <ActivitiesStep />;
      default:
        return <PlaceholderStep stepId={currentStep.id} title={currentStep.title} icon={currentStep.icon} t={t} />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('wizard.loadingProfile')}</h2>
        <p className="text-gray-600">{t('wizard.preparingQuestionnaire')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStepIndex={currentStepIndex}
        completedSteps={progress?.completedSteps || []}
        onStepClick={goToStep}
      />

      {/* Skip Onboarding Banner */}
      <div className="bg-orange-50 border-b border-orange-100">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">
                Vous pouvez passer ce questionnaire et explorer DreamScape immédiatement
              </div>
            </div>
            <button
              onClick={handleSkipOnboarding}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              <span>Passer l'onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unsaved changes warning */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm">
                Vous avez des modifications non sauvegardées qui seront perdues si vous quittez cette page.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={previousStep}
              disabled={isFirstStep || isSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isFirstStep || isSaving
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>

            {/* Middle Actions */}
            <div className="flex items-center gap-3">
              {/* Skip Button (for optional steps) */}
              {!currentStep.required && !isLastStep && (
                <button
                  onClick={skipStep}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
                >
                  Passer
                </button>
              )}

              {/* Reset Button */}
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir recommencer ? Toutes vos réponses seront perdues.')) {
                    resetOnboarding();
                  }
                }}
                disabled={isSaving}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                title="Recommencer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Next/Complete Button */}
            {isLastStep ? (
              <button
                onClick={handleCompleteOnboarding}
                disabled={!allRequiredStepsCompleted || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  allRequiredStepsCompleted && !isSaving
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!allRequiredStepsCompleted ? 'Vous devez compléter toutes les étapes obligatoires' : ''}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finalisation...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Terminer
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  canProceed && !isSaving
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Summary */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Étape {currentStepIndex + 1} sur {ONBOARDING_STEPS.length} •{' '}
              {progress?.completedSteps?.length || 0} étapes complétées
            </p>
            {!canProceed && currentStep.required && (
              <p className="text-sm text-red-600 mt-1">
                Veuillez compléter les champs requis pour continuer
              </p>
            )}
            {isLastStep && !allRequiredStepsCompleted && (
              <p className="text-sm text-red-600 mt-1">
                Vous devez compléter toutes les étapes obligatoires avant de terminer l'onboarding
              </p>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Besoin d'aide ?</h3>
            <p className="text-gray-600 text-xs mb-3">
              Ce questionnaire nous aide à personnaliser vos recommandations de voyage.
              Toutes vos réponses peuvent être modifiées plus tard.
            </p>
            <button className="text-orange-500 hover:text-orange-600 text-xs font-medium">
              Contactez notre support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;