import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Check, AlertCircle, Loader2, X, ArrowRight } from 'lucide-react';
import { ONBOARDING_STEPS } from '@/types/onboarding';
import useOnboardingStore from '@/store/onboardingStore';
import ProgressIndicator from './ProgressIndicator';

// Import step components
import DestinationsStep from './steps/DestinationsStep';
import BudgetStep from './steps/BudgetStep';
import TravelTypesStep from './steps/TravelTypesStep';

// Placeholder components for remaining steps
const PlaceholderStep: React.FC<{ stepId: string; title: string; icon: string }> = ({ stepId, title, icon }) => (
  <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-600 mb-6">Cette étape est en cours de développement.</p>
    <div className="bg-blue-50 rounded-lg p-4">
      <p className="text-sm text-blue-800">
        Step ID: <code className="font-mono bg-blue-100 px-2 py-1 rounded">{stepId}</code>
      </p>
    </div>
  </div>
);

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Initialize onboarding on mount
  useEffect(() => {
    initializeOnboarding();
  }, [initializeOnboarding]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.stepIndex !== undefined) {
        goToStep(event.state.stepIndex);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goToStep]);

  // Push state when step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.pushState(
        { stepIndex: currentStepIndex },
        '',
        `/onboarding?step=${currentStep.id}`
      );
    }
  }, [currentStepIndex, currentStep.id]);

  // Handle skip entire onboarding
  const handleSkipOnboarding = () => {
    if (confirm('Êtes-vous sûr de vouloir passer l\'onboarding ? Vous pourrez le reprendre plus tard dans vos paramètres.')) {
      skipOnboarding();
      // Redirect to the page they were trying to access or dashboard
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
      case 'travel-types':
        return <TravelTypesStep />;
      case 'style-comfort':
        return <PlaceholderStep stepId="style-comfort" title="Style de voyage" icon="🎭" />;
      case 'accommodation':
        return <PlaceholderStep stepId="accommodation" title="Hébergement" icon="🏨" />;
      case 'transport':
        return <PlaceholderStep stepId="transport" title="Transport" icon="🚁" />;
      case 'activities':
        return <PlaceholderStep stepId="activities" title="Activités" icon="🎯" />;
      case 'travel-groups':
        return <PlaceholderStep stepId="travel-groups" title="Groupes de voyage" icon="👥" />;
      case 'constraints':
        return <PlaceholderStep stepId="constraints" title="Contraintes" icon="⚠️" />;
      case 'timing':
        return <PlaceholderStep stepId="timing" title="Timing" icon="📅" />;
      case 'duration':
        return <PlaceholderStep stepId="duration" title="Durée" icon="⏰" />;
      case 'experience':
        return <PlaceholderStep stepId="experience" title="Expérience" icon="🎓" />;
      case 'review':
        return <PlaceholderStep stepId="review" title="Finalisation" icon="✅" />;
      default:
        return <PlaceholderStep stepId={currentStep.id} title={currentStep.title} icon={currentStep.icon} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement de votre profil</h2>
          <p className="text-gray-600">Préparation de votre questionnaire personnalisé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStepIndex={currentStepIndex}
        completedSteps={progress?.completedSteps || []}
        onStepClick={goToStep}
      />

      {/* Skip Onboarding Banner */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Vous pouvez passer ce questionnaire et explorer DreamScape immédiatement
              </div>
            </div>
            <button
              onClick={handleSkipOnboarding}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              <span>Passer l'onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
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
            className="max-w-2xl mx-auto mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
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
        <div className="max-w-2xl mx-auto mt-8">
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
                onClick={completeOnboarding}
                disabled={!canProceed || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  canProceed && !isSaving
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
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
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
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
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Étape {currentStepIndex + 1} sur {ONBOARDING_STEPS.length} •{' '}
              {progress?.completedSteps.length || 0} étapes complétées
            </p>
            {!canProceed && currentStep.required && (
              <p className="text-sm text-red-600 mt-1">
                Veuillez compléter les champs requis pour continuer
              </p>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Ce questionnaire nous aide à personnaliser vos recommandations de voyage.
              Toutes vos réponses peuvent être modifiées plus tard.
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Contactez notre support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;