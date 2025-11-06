import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Hotel } from 'lucide-react';
import OnboardingStepWrapper from '../OnboardingStepWrapper';
import { SelectableCard, RadioGroup } from '../FormComponents';
import { TravelStyle, ComfortLevel } from '@/types/onboarding';
import useOnboardingStore from '@/store/onboardingStore';

const StyleComfortStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();

  const travelStyle = profile.travelStyle || TravelStyle.MIXED;
  const comfortLevel = profile.comfortLevel || ComfortLevel.STANDARD;

  // Initialize with default values if not set
  React.useEffect(() => {
    if (!profile.travelStyle) {
      updateProfile({ travelStyle: TravelStyle.MIXED });
    }
    if (!profile.comfortLevel) {
      updateProfile({ comfortLevel: ComfortLevel.STANDARD });
    }
  }, []);

  const handleStyleChange = (style: string) => {
    updateProfile({ travelStyle: style as TravelStyle });
  };

  const handleComfortChange = (comfort: string) => {
    updateProfile({ comfortLevel: comfort as ComfortLevel });
  };

  const styleOptions = [
    {
      value: TravelStyle.PLANNED,
      label: 'Planifié',
      icon: '📋',
      description: 'J\'aime tout organiser à l\'avance avec un itinéraire détaillé'
    },
    {
      value: TravelStyle.SPONTANEOUS,
      label: 'Spontané',
      icon: '🎲',
      description: 'Je préfère improviser et découvrir au fil de l\'eau'
    },
    {
      value: TravelStyle.MIXED,
      label: 'Mixte',
      icon: '🔄',
      description: 'Un peu des deux : structure avec de la flexibilité'
    }
  ];

  const comfortOptions = [
    {
      value: ComfortLevel.BASIC,
      label: 'Basique',
      icon: '🎒',
      description: 'Auberges, hébergements simples, l\'essentiel me suffit'
    },
    {
      value: ComfortLevel.STANDARD,
      label: 'Standard',
      icon: '🏨',
      description: 'Hôtels 2-3 étoiles, bon rapport qualité-prix'
    },
    {
      value: ComfortLevel.PREMIUM,
      label: 'Premium',
      icon: '✨',
      description: 'Hôtels 4 étoiles, services de qualité'
    },
    {
      value: ComfortLevel.LUXURY,
      label: 'Luxe',
      icon: '💎',
      description: 'Hôtels 5 étoiles, expériences haut de gamme'
    }
  ];

  return (
    <OnboardingStepWrapper
      title="Style de voyage"
      description="Comment préférez-vous voyager ?"
      icon="🎭"
    >
      <div className="space-y-8">
        {/* Travel Style */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Style de planification
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Comment organisez-vous habituellement vos voyages ?
          </p>

          <RadioGroup
            options={styleOptions}
            value={travelStyle}
            onChange={handleStyleChange}
            name="travelStyle"
          />
        </div>

        {/* Comfort Level */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="w-5 h-5 text-purple-600" />
            Niveau de confort
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Quel niveau de confort recherchez-vous pour vos hébergements ?
          </p>

          <RadioGroup
            options={comfortOptions}
            value={comfortLevel}
            onChange={handleComfortChange}
            name="comfortLevel"
          />
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-4"
        >
          <h4 className="font-medium text-blue-900 mb-2">Votre profil de voyage</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              Style : <strong>{styleOptions.find(s => s.value === travelStyle)?.label || 'Non défini'}</strong>
            </p>
            <p>
              Confort : <strong>{comfortOptions.find(c => c.value === comfortLevel)?.label || 'Non défini'}</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </OnboardingStepWrapper>
  );
};

export default StyleComfortStep;
