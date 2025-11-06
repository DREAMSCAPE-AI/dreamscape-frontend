import React from 'react';
import { motion } from 'framer-motion';
import { Hotel, Star } from 'lucide-react';
import OnboardingStepWrapper from '../OnboardingStepWrapper';
import { SelectableCard } from '../FormComponents';
import { ComfortLevel } from '@/types/onboarding';
import useOnboardingStore from '@/store/onboardingStore';

const AccommodationStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();

  const selectedTypes = profile.accommodationTypes || [];
  const accommodationLevel = profile.accommodationLevel || ComfortLevel.STANDARD;

  // Initialize with default values if not set
  React.useEffect(() => {
    if (!profile.accommodationLevel) {
      updateProfile({ accommodationLevel: ComfortLevel.STANDARD });
    }
    if (!profile.accommodationTypes || profile.accommodationTypes.length === 0) {
      updateProfile({ accommodationTypes: ['hotel'] });
    }
  }, []);

  const handleTypeToggle = (typeId: string) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter(t => t !== typeId)
      : [...selectedTypes, typeId];

    updateProfile({ accommodationTypes: newTypes });
  };

  const handleLevelChange = (level: ComfortLevel) => {
    updateProfile({ accommodationLevel: level });
  };

  const accommodationTypeOptions = [
    {
      id: 'hotel',
      title: 'Hôtel',
      description: 'Hôtels classiques avec services',
      icon: '🏨'
    },
    {
      id: 'apartment',
      title: 'Appartement',
      description: 'Locations avec cuisine et espace',
      icon: '🏠'
    },
    {
      id: 'resort',
      title: 'Resort',
      description: 'Complexes tout-inclus',
      icon: '🏖️'
    },
    {
      id: 'hostel',
      title: 'Auberge',
      description: 'Hébergements économiques',
      icon: '🎒'
    },
    {
      id: 'villa',
      title: 'Villa',
      description: 'Maisons de luxe privées',
      icon: '🏡'
    },
    {
      id: 'boutique_hotel',
      title: 'Hôtel Boutique',
      description: 'Petits hôtels de charme',
      icon: '✨'
    },
    {
      id: 'guesthouse',
      title: 'Chambre d\'hôtes',
      description: 'Hébergements chez l\'habitant',
      icon: '🏘️'
    },
    {
      id: 'camping',
      title: 'Camping',
      description: 'Campings et nature',
      icon: '⛺'
    }
  ];

  const comfortLevelOptions = [
    {
      value: ComfortLevel.BASIC,
      label: 'Basique',
      icon: '🎒',
      description: 'Simple et fonctionnel'
    },
    {
      value: ComfortLevel.STANDARD,
      label: 'Standard',
      icon: '🏨',
      description: 'Confortable et pratique'
    },
    {
      value: ComfortLevel.PREMIUM,
      label: 'Premium',
      icon: '✨',
      description: 'Haute qualité et services'
    },
    {
      value: ComfortLevel.LUXURY,
      label: 'Luxe',
      icon: '💎',
      description: 'Excellence et raffinement'
    }
  ];

  return (
    <OnboardingStepWrapper
      title="Hébergement"
      description="Quels types d'hébergements préférez-vous ?"
      icon="🏨"
    >
      <div className="space-y-8">
        {/* Accommodation Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="w-5 h-5 text-blue-600" />
            Types d'hébergement
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Sélectionnez tous les types qui vous intéressent (minimum 1)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accommodationTypeOptions.map((type) => (
              <SelectableCard
                key={type.id}
                id={type.id}
                title={type.title}
                description={type.description}
                icon={<span className="text-2xl">{type.icon}</span>}
                isSelected={selectedTypes.includes(type.id)}
                onToggle={handleTypeToggle}
              />
            ))}
          </div>
        </div>

        {/* Comfort Level */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Niveau de confort habituel
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Quel niveau de confort recherchez-vous généralement ?
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {comfortLevelOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleLevelChange(option.value)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  accommodationLevel === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className={`font-medium ${
                  accommodationLevel === option.value ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {option.label}
                </div>
                <div className={`text-xs ${
                  accommodationLevel === option.value ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {option.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Selected summary */}
        {selectedTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-blue-900 mb-2">Vos préférences d'hébergement</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <strong>{selectedTypes.length}</strong> type(s) sélectionné(s)
              </p>
              <p>
                Niveau : <strong>{comfortLevelOptions.find(o => o.value === accommodationLevel)?.label}</strong>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingStepWrapper>
  );
};

export default AccommodationStep;
