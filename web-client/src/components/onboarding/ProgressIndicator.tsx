import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
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
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Étape {currentStepIndex + 1} sur {totalSteps}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progressPercentage)}% complété
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
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
                  onClick={() => onStepClick?.(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStepIndex
                      ? 'bg-blue-600'
                      : completedSteps.includes(step.id)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                  disabled={!onStepClick}
                />
                {index < 4 && <div className="w-2 h-px bg-gray-300 mx-1" />}
              </div>
            ))}
            {totalSteps > 5 && (
              <>
                <span className="text-gray-400 mx-2">...</span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentStepIndex >= totalSteps - 1
                      ? 'bg-blue-600'
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
                onClick={() => onStepClick?.(index)}
                className={`flex items-center justify-center min-w-12 h-12 rounded-full text-lg transition-all duration-200 ${
                  index === currentStepIndex
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : completedSteps.includes(step.id)
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                } ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
                disabled={!onStepClick}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </button>

              {/* Step info */}
              <div className="ml-3 min-w-0 flex-1">
                <div className={`font-medium text-sm ${
                  index === currentStepIndex
                    ? 'text-blue-600'
                    : completedSteps.includes(step.id)
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                {!step.required && (
                  <div className="text-xs text-gray-400">Optionnel</div>
                )}
              </div>

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