import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Car } from 'lucide-react';
import OnboardingStepWrapper from '../OnboardingStepWrapper';
import { SelectableCard } from '../FormComponents';
import useOnboardingStore from '@/store/onboardingStore';

const TransportStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();

  const selectedModes = profile.transportModes || [];
  const cabinClassPreference = profile.cabinClassPreference || 'economy';

  // Initialize with default values if not set
  React.useEffect(() => {
    if (!profile.cabinClassPreference) {
      updateProfile({ cabinClassPreference: 'economy' });
    }
    if (!profile.transportModes || profile.transportModes.length === 0) {
      updateProfile({ transportModes: ['flight'] });
    }
  }, []);

  const handleModeToggle = (modeId: string) => {
    const newModes = selectedModes.includes(modeId)
      ? selectedModes.filter(m => m !== modeId)
      : [...selectedModes, modeId];

    updateProfile({ transportModes: newModes });
  };

  const handleCabinClassChange = (cabinClass: string) => {
    updateProfile({ cabinClassPreference: cabinClass });
  };

  const transportModeOptions = [
    {
      id: 'flight',
      title: 'Avion',
      description: 'Vols commerciaux',
      icon: '✈️'
    },
    {
      id: 'train',
      title: 'Train',
      description: 'Voyages ferroviaires',
      icon: '🚄'
    },
    {
      id: 'car',
      title: 'Voiture',
      description: 'Location ou covoiturage',
      icon: '🚗'
    },
    {
      id: 'bus',
      title: 'Bus',
      description: 'Autocars et bus longue distance',
      icon: '🚌'
    },
    {
      id: 'boat',
      title: 'Bateau',
      description: 'Ferry et croisières',
      icon: '🚢'
    },
    {
      id: 'bicycle',
      title: 'Vélo',
      description: 'Cyclotourisme',
      icon: '🚲'
    }
  ];

  const cabinClassOptions = [
    {
      value: 'economy',
      label: 'Économique',
      icon: '💺',
      description: 'Classe économique standard'
    },
    {
      value: 'premium_economy',
      label: 'Éco Premium',
      icon: '🪑',
      description: 'Plus d\'espace et confort'
    },
    {
      value: 'business',
      label: 'Affaires',
      icon: '💼',
      description: 'Sièges-lits et services premium'
    },
    {
      value: 'first',
      label: 'Première',
      icon: '👑',
      description: 'Luxe et excellence'
    }
  ];

  return (
    <OnboardingStepWrapper
      title="Transport"
      description="Comment préférez-vous vous déplacer ?"
      icon="✈️"
    >
      <div className="space-y-8">
        {/* Transport Modes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-orange-500" />
            Modes de transport
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Sélectionnez tous les modes qui vous conviennent (minimum 1)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transportModeOptions.map((mode) => (
              <SelectableCard
                key={mode.id}
                id={mode.id}
                title={mode.title}
                description={mode.description}
                icon={<span className="text-2xl">{mode.icon}</span>}
                isSelected={selectedModes.includes(mode.id)}
                onToggle={handleModeToggle}
              />
            ))}
          </div>
        </div>

        {/* Cabin Class Preference (for flights) */}
        {selectedModes.includes('flight') && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-purple-600" />
              Classe de cabine préférée (avion)
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Quelle classe préférez-vous pour vos vols ?
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cabinClassOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleCabinClassChange(option.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    cabinClassPreference === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className={`font-medium ${
                    cabinClassPreference === option.value ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </div>
                  <div className={`text-xs ${
                    cabinClassPreference === option.value ? 'text-purple-700' : 'text-gray-600'
                  }`}>
                    {option.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Selected summary */}
        {selectedModes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-orange-900 mb-2">Vos préférences de transport</h4>
            <div className="space-y-1 text-sm text-orange-800">
              <p>
                <strong>{selectedModes.length}</strong> mode(s) de transport sélectionné(s)
              </p>
              {selectedModes.includes('flight') && (
                <p>
                  Classe avion : <strong>{cabinClassOptions.find(o => o.value === cabinClassPreference)?.label}</strong>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingStepWrapper>
  );
};

export default TransportStep;
