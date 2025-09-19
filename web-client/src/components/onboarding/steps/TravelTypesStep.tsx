import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Mountain, Camera, Users, User } from 'lucide-react';
import OnboardingStepWrapper from '../OnboardingStepWrapper';
import { SelectableCard } from '../FormComponents';
import { TravelType } from '@/types/onboarding';
import useOnboardingStore from '@/store/onboardingStore';

const TravelTypesStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();
  const selectedTypes = profile.travelTypes || [];

  const handleTypeToggle = (typeId: string) => {
    const type = typeId as TravelType;
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];

    updateProfile({ travelTypes: newTypes });
  };

  const travelTypeGroups = [
    {
      title: 'Voyages personnels',
      icon: <Heart className="w-5 h-5" />,
      types: [
        {
          id: TravelType.LEISURE,
          title: 'Loisirs',
          description: 'Détente, vacances, plaisir',
          icon: '🏖️'
        },
        {
          id: TravelType.ROMANTIC,
          title: 'Romantique',
          description: 'Lune de miel, anniversaire, couple',
          icon: '💕'
        },
        {
          id: TravelType.FAMILY,
          title: 'Famille',
          description: 'Voyages avec enfants, famille élargie',
          icon: '👨‍👩‍👧‍👦'
        },
        {
          id: TravelType.SOLO,
          title: 'Solo',
          description: 'Voyage en solitaire, introspection',
          icon: '🚶‍♀️'
        }
      ]
    },
    {
      title: 'Voyages d\'expérience',
      icon: <Mountain className="w-5 h-5" />,
      types: [
        {
          id: TravelType.ADVENTURE,
          title: 'Aventure',
          description: 'Sports extrêmes, défis, adrénaline',
          icon: '🏔️'
        },
        {
          id: TravelType.CULTURAL,
          title: 'Culturel',
          description: 'Musées, histoire, patrimoine',
          icon: '🏛️'
        },
        {
          id: TravelType.WELLNESS,
          title: 'Bien-être',
          description: 'Spa, yoga, détox, santé',
          icon: '🧘‍♀️'
        },
        {
          id: TravelType.ECO_TOURISM,
          title: 'Écotourisme',
          description: 'Nature, durabilité, environnement',
          icon: '🌿'
        }
      ]
    },
    {
      title: 'Voyages professionnels',
      icon: <Briefcase className="w-5 h-5" />,
      types: [
        {
          id: TravelType.BUSINESS,
          title: 'Affaires',
          description: 'Réunions, conférences, networking',
          icon: '💼'
        },
        {
          id: TravelType.EDUCATIONAL,
          title: 'Éducatif',
          description: 'Formations, séminaires, apprentissage',
          icon: '📚'
        }
      ]
    },
    {
      title: 'Voyages spécialisés',
      icon: <Camera className="w-5 h-5" />,
      types: [
        {
          id: TravelType.SPORTS,
          title: 'Sports',
          description: 'Événements sportifs, compétitions',
          icon: '⚽'
        },
        {
          id: TravelType.RELIGIOUS,
          title: 'Religieux',
          description: 'Pèlerinages, sites spirituels',
          icon: '🕊️'
        },
        {
          id: TravelType.MEDICAL,
          title: 'Médical',
          description: 'Soins médicaux, tourisme santé',
          icon: '🏥'
        }
      ]
    },
    {
      title: 'Voyages par budget',
      icon: <Users className="w-5 h-5" />,
      types: [
        {
          id: TravelType.LUXURY,
          title: 'Luxe',
          description: 'Expériences haut de gamme, service premium',
          icon: '💎'
        },
        {
          id: TravelType.BUDGET,
          title: 'Budget',
          description: 'Voyages économiques, backpacking',
          icon: '🎒'
        },
        {
          id: TravelType.GROUP,
          title: 'Groupe',
          description: 'Voyages organisés, circuits',
          icon: '👥'
        }
      ]
    }
  ];

  const getSelectedCount = () => selectedTypes.length;
  const getRecommendedMinimum = () => 3;

  return (
    <OnboardingStepWrapper
      title="Types de voyage"
      description="Sélectionnez tous les types de voyages qui vous intéressent"
      icon="✈️"
    >
      <div className="space-y-8">
        {/* Progress indicator */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">
              {getSelectedCount()} type(s) sélectionné(s)
            </span>
            <span className="text-sm text-blue-700">
              Minimum recommandé : {getRecommendedMinimum()}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((getSelectedCount() / getRecommendedMinimum()) * 100, 100)}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Travel type groups */}
        {travelTypeGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {group.icon}
              {group.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.types.map((type) => (
                <SelectableCard
                  key={type.id}
                  id={type.id}
                  title={type.title}
                  description={type.description}
                  icon={<span className="text-2xl">{type.icon}</span>}
                  isSelected={selectedTypes.includes(type.id as TravelType)}
                  onToggle={handleTypeToggle}
                />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Selected types summary */}
        {selectedTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-green-900 mb-3">Vos types de voyage sélectionnés :</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map((type) => {
                const typeInfo = travelTypeGroups
                  .flatMap(g => g.types)
                  .find(t => t.id === type);

                return (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    <span>{typeInfo?.icon}</span>
                    {typeInfo?.title}
                  </span>
                );
              })}
            </div>

            {/* Personalized recommendations preview */}
            <div className="mt-4 pt-3 border-t border-green-200">
              <p className="text-sm text-green-800">
                <strong>Recommandations personnalisées basées sur vos choix :</strong>
              </p>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                {selectedTypes.includes(TravelType.ADVENTURE) && (
                  <li>• Activités outdoor et sports d'aventure</li>
                )}
                {selectedTypes.includes(TravelType.CULTURAL) && (
                  <li>• Visites guidées et expériences culturelles</li>
                )}
                {selectedTypes.includes(TravelType.LUXURY) && (
                  <li>• Hôtels 5 étoiles et services premium</li>
                )}
                {selectedTypes.includes(TravelType.FAMILY) && (
                  <li>• Activités family-friendly et hébergements adaptés</li>
                )}
                {selectedTypes.includes(TravelType.WELLNESS) && (
                  <li>• Spas, centres de bien-être et retraites santé</li>
                )}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Helpful tips */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">💡 Conseils</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Sélectionnez au moins 3 types pour des recommandations plus précises</li>
            <li>• Vous pouvez choisir plusieurs types - nous adaptons nos suggestions</li>
            <li>• Ces préférences peuvent être modifiées à tout moment dans votre profil</li>
          </ul>
        </div>
      </div>
    </OnboardingStepWrapper>
  );
};

export default TravelTypesStep;