import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ONBOARDING_STEPS } from '@/types/onboarding';

interface ProgressIndicatorProps {
  currentStepIndex: number;
  completedSteps: string[];
  onStepClick?: (stepIndex: number) => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStepIndex,
  completedSteps,
  onStepClick
}) => {
  const totalSteps = ONBOARDING_STEPS.length;
  // Base progress on completed steps, not current step index
  // This ensures 0% at start and 100% only when all steps are completed
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  // Determine which steps are clickable
  const isStepClickable = (index: number): boolean => {
    const step = ONBOARDING_STEPS[index];

    // Can click on completed steps
    if (completedSteps.includes(step.id)) {
      return true;
    }

    // Can click on the first non-completed step (current step)
    const firstIncompleteIndex = ONBOARDING_STEPS.findIndex(
      s => !completedSteps.includes(s.id)
    );

    return index === firstIncompleteIndex;
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Étape {currentStepIndex + 1} sur {totalSteps}
            </span>
            <span className="text-sm font-medium text-orange-500">
              {Math.round(progressPercentage)}% complété
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step indicators - Mobile (simplified) */}
        <div className="flex md:hidden justify-center">
          <div className="flex items-center gap-1">
            {ONBOARDING_STEPS.slice(0, 5).map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isStepClickable(index) && onStepClick?.(index)}
                  className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full transition-colors ${
                    onStepClick && isStepClickable(index) ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'
                  }`}
                  disabled={!onStepClick || !isStepClickable(index)}
                  aria-label={`Go to step ${index + 1}`}
                >
                  <div className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStepIndex
                      ? 'bg-orange-500'
                      : completedSteps.includes(step.id)
                      ? 'bg-pink-500'
                      : 'bg-gray-300'
                  } ${!onStepClick || !isStepClickable(index) ? 'opacity-60' : ''}`} />
                </button>
                {index < 4 && <div className="w-2 h-px bg-gray-300" />}
              </div>
            ))}
            {totalSteps > 5 && (
              <>
                <span className="text-gray-400 mx-2">...</span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentStepIndex >= totalSteps - 1
                      ? 'bg-orange-500'
                      : 'bg-gray-300'
                  }`}
                />
              </>
            )}
          </div>
        </div>

        {/* Step indicators - Desktop (detailed) */}
        <div className="hidden md:flex items-center justify-between overflow-x-auto">
          {ONBOARDING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <button
                onClick={() => isStepClickable(index) && onStepClick?.(index)}
                className={`flex items-center justify-center min-w-12 h-12 rounded-full text-lg transition-all duration-200 ${
                  index === currentStepIndex
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : completedSteps.includes(step.id)
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-gray-200 text-gray-500'
                } ${onStepClick && isStepClickable(index) ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'}`}
                disabled={!onStepClick || !isStepClickable(index)}
                title={!isStepClickable(index) ? 'Complétez les étapes précédentes pour déverrouiller' : ''}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </button>

              {/* Step info - Only show for current step */}
              {index === currentStepIndex && (
                <div className="ml-3 min-w-0 flex-1">
                  <div className={`font-medium text-sm ${
                    index === currentStepIndex
                      ? 'text-orange-500'
                      : completedSteps.includes(step.id)
                      ? 'text-pink-500'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  {!step.required && (
                    <div className="text-xs text-gray-400">Optionnel</div>
                  )}
                </div>
              )}

              {/* Connector */}
              {index < ONBOARDING_STEPS.length - 1 && (
                <div className="flex items-center mx-4">
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;