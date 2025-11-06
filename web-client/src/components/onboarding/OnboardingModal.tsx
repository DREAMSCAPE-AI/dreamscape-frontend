import React, { useState } from 'react';
import { X } from 'lucide-react';
import OnboardingFlow from './OnboardingFlow';
import type { UserPreferences } from './OnboardingFlow';

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

          {/* OnboardingFlow */}
          <OnboardingFlow onComplete={onComplete} />
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
