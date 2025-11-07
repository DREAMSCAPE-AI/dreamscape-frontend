import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Star, ChevronRight } from 'lucide-react';
import useOnboardingStore from '@/store/onboardingStore';

interface OnboardingPromptProps {
  className?: string;
}

const OnboardingPrompt: React.FC<OnboardingPromptProps> = ({ className = '' }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { getOnboardingStatus, getCompletionPercentage } = useOnboardingStore();

  const onboardingStatus = getOnboardingStatus();
  const completionPercentage = getCompletionPercentage();

  // Only show for skipped or incomplete onboarding
  const shouldShow = (onboardingStatus === 'skipped' ||
                     (onboardingStatus === 'in_progress' && completionPercentage < 100)) &&
                     !isDismissed;

  if (!shouldShow) {
    return null;
  }

  const isSkipped = onboardingStatus === 'skipped';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg shadow-lg overflow-hidden ${className}`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4">
            <Star className="w-6 h-6" />
          </div>
          <div className="absolute bottom-4 right-4">
            <Settings className="w-8 h-8" />
          </div>
          <div className="absolute top-8 right-8">
            <Star className="w-4 h-4" />
          </div>
        </div>

        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isSkipped ? 'Personnalisez votre expérience' : 'Continuez votre profil'}
                </h3>
                <p className="text-orange-100 text-sm">
                  {isSkipped
                    ? 'Complétez votre profil pour des recommandations sur mesure'
                    : `${Math.round(completionPercentage)}% complété - Quelques minutes suffisent`
                  }
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-orange-200 rounded-full"></div>
                  <span>Recommandations de destinations personnalisées</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-orange-200 rounded-full"></div>
                  <span>Suggestions d'activités adaptées à vos goûts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-200 rounded-full"></div>
                  <span>Offres exclusives selon votre budget</span>
                </div>
              </div>

              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 bg-white text-orange-500 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                {isSkipped ? 'Commencer le questionnaire' : 'Continuer le questionnaire'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingPrompt;