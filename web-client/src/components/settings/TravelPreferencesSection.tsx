import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  DollarSign,
  Plane,
  Hotel,
  Activity,
  Users,
  Clock,
  Settings,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import useOnboardingStore from '@/store/onboardingStore';
import {
  TravelType,
  AccommodationType,
  BudgetFlexibility,
  TravelStyle,
  ComfortLevel
} from '@/types/onboarding';

const TravelPreferencesSection: React.FC = () => {
  const {
    profile,
    progress,
    getCurrentStep,
    getCompletionPercentage,
    initializeOnboarding,
    isLoading
  } = useOnboardingStore();

  // Initialize onboarding data when component mounts
  useEffect(() => {
    initializeOnboarding();
  }, [initializeOnboarding]);

  const completionPercentage = getCompletionPercentage();
  const completedSteps = progress?.completedSteps || [];
  const currentStep = getCurrentStep();

  // Helper functions to display enum values in French
  const formatTravelType = (type: TravelType): string => {
    const translations: Record<TravelType, string> = {
      [TravelType.LEISURE]: 'Loisirs',
      [TravelType.BUSINESS]: 'Affaires',
      [TravelType.ADVENTURE]: 'Aventure',
      [TravelType.CULTURAL]: 'Culturel',
      [TravelType.ROMANTIC]: 'Romantique',
      [TravelType.FAMILY]: 'Famille',
      [TravelType.SOLO]: 'Solo',
      [TravelType.GROUP]: 'Groupe',
      [TravelType.LUXURY]: 'Luxe',
      [TravelType.BUDGET]: 'Budget',
      [TravelType.ECO_TOURISM]: 'Écotourisme',
      [TravelType.WELLNESS]: 'Bien-être',
      [TravelType.EDUCATIONAL]: 'Éducatif',
      [TravelType.RELIGIOUS]: 'Religieux',
      [TravelType.MEDICAL]: 'Médical',
      [TravelType.SPORTS]: 'Sports'
    };
    return translations[type] || type;
  };

  const formatBudgetFlexibility = (flexibility: BudgetFlexibility): string => {
    const translations: Record<BudgetFlexibility, string> = {
      [BudgetFlexibility.STRICT]: 'Budget strict',
      [BudgetFlexibility.SOMEWHAT_FLEXIBLE]: 'Légèrement flexible',
      [BudgetFlexibility.FLEXIBLE]: 'Flexible',
      [BudgetFlexibility.VERY_FLEXIBLE]: 'Très flexible'
    };
    return translations[flexibility] || flexibility;
  };

  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">Chargement de vos préférences...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">Profil de voyage</h2>
            <p className="text-blue-700 text-sm">
              {completionPercentage === 100
                ? 'Votre profil de voyage est complet !'
                : 'Complétez votre profil pour des recommandations personnalisées'
              }
            </p>
          </div>
          {completionPercentage === 100 ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-orange-500" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-800">
              {Math.round(completionPercentage)}% complété
            </span>
            <span className="text-sm text-blue-600">
              {completedSteps.length} étapes sur 13
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            to="/onboarding"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {completionPercentage === 0 ? (
              <>
                <Settings className="w-4 h-4" />
                Commencer le questionnaire
              </>
            ) : completionPercentage === 100 ? (
              <>
                <Settings className="w-4 h-4" />
                Modifier mes préférences
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Continuer ({currentStep.title})
              </>
            )}
            <ExternalLink className="w-3 h-3" />
          </Link>

          {completionPercentage > 0 && (
            <Link
              to="/onboarding"
              className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Voir le questionnaire complet
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Current Preferences Summary */}
      {completionPercentage > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destinations */}
          {profile.preferredDestinations && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Destinations préférées</h3>
              </div>

              {profile.preferredDestinations.destinations?.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredDestinations.destinations.slice(0, 3).map((dest: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {dest}
                      </span>
                    ))}
                    {profile.preferredDestinations.destinations.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{profile.preferredDestinations.destinations.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucune destination définie</p>
              )}
            </div>
          )}

          {/* Budget */}
          {profile.globalBudgetRange && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Budget de voyage</h3>
              </div>

              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(profile.globalBudgetRange.min, profile.globalBudgetRange.currency)} - {formatCurrency(profile.globalBudgetRange.max, profile.globalBudgetRange.currency)}
                </div>
                {profile.budgetFlexibility && (
                  <div className="text-sm text-gray-600">
                    Flexibilité : {formatBudgetFlexibility(profile.budgetFlexibility)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Travel Types */}
          {profile.travelTypes && profile.travelTypes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Plane className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Types de voyage</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.travelTypes.slice(0, 4).map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {formatTravelType(type)}
                  </span>
                ))}
                {profile.travelTypes.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{profile.travelTypes.length - 4} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Style & Comfort */}
          {(profile.travelStyle || profile.comfortLevel) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Hotel className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Style de voyage</h3>
              </div>

              <div className="space-y-2">
                {profile.travelStyle && (
                  <div className="text-sm">
                    <span className="font-medium">Style :</span> {profile.travelStyle}
                  </div>
                )}
                {profile.comfortLevel && (
                  <div className="text-sm">
                    <span className="font-medium">Confort :</span> {profile.comfortLevel}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activities */}
          {profile.preferredActivities && profile.preferredActivities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold">Activités préférées</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.preferredActivities.slice(0, 3).map((activity, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                    {activity}
                  </span>
                ))}
                {profile.preferredActivities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{profile.preferredActivities.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Travel Groups */}
          {profile.travelGroupTypes && profile.travelGroupTypes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold">Groupes de voyage</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.travelGroupTypes.slice(0, 3).map((group, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                    {group}
                  </span>
                ))}
                {profile.travelGroupTypes.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{profile.travelGroupTypes.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {completionPercentage === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configurez vos préférences de voyage
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Répondez à notre questionnaire personnalisé pour recevoir des recommandations
            adaptées à vos goûts et votre style de voyage.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Settings className="w-5 h-5" />
            Commencer le questionnaire
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">💡 À propos de vos préférences</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Vos préférences sont sauvegardées automatiquement à chaque étape</p>
          <p>• Vous pouvez modifier vos réponses à tout moment</p>
          <p>• Plus votre profil est complet, plus nos recommandations seront précises</p>
          <p>• Toutes vos données sont privées et sécurisées</p>
        </div>
      </div>
    </div>
  );
};

export default TravelPreferencesSection;