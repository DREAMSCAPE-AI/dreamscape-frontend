import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Globe, Plus } from 'lucide-react';
import OnboardingStepWrapper from '../OnboardingStepWrapper';
import { TagInput } from '../FormComponents';
import useOnboardingStore from '@/store/onboardingStore';

const DestinationsStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Popular destinations by category
  const destinationCategories = {
    'Europe': [
      'Paris, France', 'Rome, Italie', 'Londres, Royaume-Uni', 'Amsterdam, Pays-Bas',
      'Barcelone, Espagne', 'Prague, République tchèque', 'Vienne, Autriche'
    ],
    'Asie': [
      'Tokyo, Japon', 'Bangkok, Thaïlande', 'Singapour', 'Hong Kong',
      'Seoul, Corée du Sud', 'Mumbai, Inde', 'Jakarta, Indonésie'
    ],
    'Amérique du Nord': [
      'New York, États-Unis', 'Los Angeles, États-Unis', 'Toronto, Canada',
      'Vancouver, Canada', 'Mexico, Mexique', 'San Francisco, États-Unis'
    ],
    'Amérique du Sud': [
      'Rio de Janeiro, Brésil', 'Buenos Aires, Argentine', 'Lima, Pérou',
      'Santiago, Chili', 'Bogotá, Colombie', 'Caracas, Venezuela'
    ],
    'Afrique': [
      'Le Cap, Afrique du Sud', 'Marrakech, Maroc', 'Le Caire, Égypte',
      'Lagos, Nigeria', 'Nairobi, Kenya', 'Casablanca, Maroc'
    ],
    'Océanie': [
      'Sydney, Australie', 'Melbourne, Australie', 'Auckland, Nouvelle-Zélande',
      'Perth, Australie', 'Brisbane, Australie'
    ]
  };

  const allDestinations = Object.values(destinationCategories).flat();

  const currentDestinations = profile.preferredDestinations?.destinations || [];
  const bucketListDestinations = profile.preferredDestinations?.bucketList || [];

  const handleDestinationsChange = (destinations: string[]) => {
    updateProfile({
      preferredDestinations: {
        ...profile.preferredDestinations,
        destinations
      }
    });
  };

  const handleBucketListChange = (bucketList: string[]) => {
    updateProfile({
      preferredDestinations: {
        ...profile.preferredDestinations,
        bucketList
      }
    });
  };

  const addQuickDestination = (destination: string) => {
    if (!currentDestinations.includes(destination)) {
      handleDestinationsChange([...currentDestinations, destination]);
    }
  };

  return (
    <OnboardingStepWrapper
      title="Destinations préférées"
      description="Partagez vos destinations de rêve et celles que vous avez déjà visitées"
      icon="🌍"
    >
      <div className="space-y-8">
        {/* Destinations visitées ou préférées */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Destinations visitées ou préférées
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Ajoutez les destinations que vous avez visitées ou que vous aimeriez revisiter
          </p>

          <TagInput
            value={currentDestinations}
            onChange={handleDestinationsChange}
            placeholder="Ex: Paris, Tokyo, New York..."
            suggestions={allDestinations}
            className="mb-4"
          />

          {/* Quick add popular destinations */}
          <div className="space-y-4">
            {Object.entries(destinationCategories).map(([category, destinations]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-800 mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {destinations.slice(0, 6).map((destination) => (
                    <motion.button
                      key={destination}
                      onClick={() => addQuickDestination(destination)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        currentDestinations.includes(destination)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={currentDestinations.includes(destination)}
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {destination}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bucket list */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Liste de rêve (Bucket List)
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Destinations que vous rêvez de découvrir un jour
          </p>

          <TagInput
            value={bucketListDestinations}
            onChange={handleBucketListChange}
            placeholder="Ex: Maldives, Islande, Patagonie..."
            suggestions={allDestinations}
          />
        </div>

        {/* Travel style preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Types de destinations préférées
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'urban', label: 'Urbain', icon: '🏙️', desc: 'Grandes villes' },
              { id: 'beach', label: 'Plage', icon: '🏖️', desc: 'Côtes et îles' },
              { id: 'mountain', label: 'Montagne', icon: '🏔️', desc: 'Altitude et nature' },
              { id: 'cultural', label: 'Culturel', icon: '🏛️', desc: 'Histoire et art' },
              { id: 'adventure', label: 'Aventure', icon: '🎿', desc: 'Sports et défis' },
              { id: 'nature', label: 'Nature', icon: '🌲', desc: 'Parcs et wildlife' }
            ].map((type) => {
              const selectedTypes = profile.preferredDestinations?.destinationTypes || [];
              const isSelected = selectedTypes.includes(type.id);

              return (
                <motion.button
                  key={type.id}
                  onClick={() => {
                    const newTypes = isSelected
                      ? selectedTypes.filter(t => t !== type.id)
                      : [...selectedTypes, type.id];

                    updateProfile({
                      preferredDestinations: {
                        ...profile.preferredDestinations,
                        destinationTypes: newTypes
                      }
                    });
                  }}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {type.label}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {type.desc}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {(currentDestinations.length > 0 || bucketListDestinations.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-blue-900 mb-2">Résumé de vos préférences</h4>
            <div className="space-y-1 text-sm text-blue-800">
              {currentDestinations.length > 0 && (
                <p><strong>{currentDestinations.length}</strong> destinations visitées/préférées</p>
              )}
              {bucketListDestinations.length > 0 && (
                <p><strong>{bucketListDestinations.length}</strong> destinations de rêve</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingStepWrapper>
  );
};

export default DestinationsStep;