import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import OnboardingFlow from './OnboardingFlow';
import type { UserPreferences } from './OnboardingFlow';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (preferences: UserPreferences) => void;
  onCancel: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, onCancel }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen) return null;

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  const cancelCancellation = () => {
    setShowCancelConfirm(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen">
          {/* Cancel Button - Fixed in top right */}
          <button
            onClick={handleCancel}
            className="fixed top-4 right-4 z-[60] p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
            title="Annuler l'onboarding"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {/* OnboardingFlow wrapped in ErrorBoundary */}
          <ErrorBoundary
            fallback={
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Une erreur est survenue
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Impossible de charger l'onboarding. Vous pouvez réessayer plus tard depuis vos paramètres.
                  </p>
                  <button
                    onClick={onCancel}
                    className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            }
          >
            <OnboardingFlow onComplete={onComplete} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[70]" onClick={cancelCancellation} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[80] bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-3">Annuler l'onboarding ?</h3>
            <p className="text-gray-600 mb-6">
              Vos préférences ne seront pas sauvegardées. Vous devrez refaire l'onboarding lors de votre prochaine visite du tableau de bord.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelCancellation}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Continuer l'onboarding
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OnboardingModal;
