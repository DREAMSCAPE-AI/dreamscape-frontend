import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';
import OnboardingStepWrapper from '../OnboardingStepWrapper';
import { SelectableCard, RadioGroup } from '../FormComponents';
import { ActivityLevel } from '@/types/onboarding';
import useOnboardingStore from '@/store/onboardingStore';

const ActivitiesStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();

  const selectedActivities = profile.activityTypes || [];
  const activityLevel = profile.activityLevel || ActivityLevel.MODERATE;

  // Initialize with default values if not set
  React.useEffect(() => {
    if (!profile.activityLevel) {
      updateProfile({ activityLevel: ActivityLevel.MODERATE });
    }
  }, []);

  const handleActivityToggle = (activityId: string) => {
    const newActivities = selectedActivities.includes(activityId)
      ? selectedActivities.filter(a => a !== activityId)
      : [...selectedActivities, activityId];

    updateProfile({ activityTypes: newActivities });
  };

  const handleLevelChange = (level: string) => {
    updateProfile({ activityLevel: level as ActivityLevel });
  };

  const activityOptions = [
    {
      id: 'museums',
      title: 'Musées',
      description: 'Visites culturelles',
      icon: '🏛️'
    },
    {
      id: 'nature',
      title: 'Nature',
      description: 'Randonnées et plein air',
      icon: '🌲'
    },
    {
      id: 'beaches',
      title: 'Plages',
      description: 'Détente au soleil',
      icon: '🏖️'
    },
    {
      id: 'adventure',
      title: 'Aventure',
      description: 'Sports extrêmes',
      icon: '🏔️'
    },
    {
      id: 'nightlife',
      title: 'Vie nocturne',
      description: 'Bars et clubs',
      icon: '🎉'
    },
    {
      id: 'shopping',
      title: 'Shopping',
      description: 'Boutiques et marchés',
      icon: '🛍️'
    },
    {
      id: 'food',
      title: 'Gastronomie',
      description: 'Restaurants et cuisine locale',
      icon: '🍽️'
    },
    {
      id: 'sports',
      title: 'Sports',
      description: 'Activités sportives',
      icon: '⚽'
    },
    {
      id: 'wellness',
      title: 'Bien-être',
      description: 'Spa et relaxation',
      icon: '🧘‍♀️'
    },
    {
      id: 'water_sports',
      title: 'Sports aquatiques',
      description: 'Plongée, surf, voile',
      icon: '🏄‍♂️'
    }
  ];

  const activityLevelOptions = [
    {
      value: ActivityLevel.LOW,
      label: 'Tranquille',
      icon: '🛋️',
      description: 'Activités douces et détente'
    },
    {
      value: ActivityLevel.MODERATE,
      label: 'Modéré',
      icon: '🚶‍♀️',
      description: 'Mix équilibré d\'activités'
    },
    {
      value: ActivityLevel.HIGH,
      label: 'Actif',
      icon: '🏃‍♂️',
      description: 'Journées bien remplies'
    },
    {
      value: ActivityLevel.VERY_HIGH,
      label: 'Très actif',
      icon: '⚡',
      description: 'Programme intense et sportif'
    }
  ];

  return (
    <OnboardingStepWrapper
      title="Activités"
      description="Quelles activités vous plaisent lors de vos voyages ?"
      icon="🎯"
    >
      <div className="space-y-8">
        {/* Activity Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Types d'activités
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Sélectionnez toutes les activités qui vous intéressent
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activityOptions.map((activity) => (
              <SelectableCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                description={activity.description}
                icon={<span className="text-2xl">{activity.icon}</span>}
                isSelected={selectedActivities.includes(activity.id)}
                onToggle={handleActivityToggle}
              />
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Niveau d'activité
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            À quel rythme préférez-vous voyager ?
          </p>

          <RadioGroup
            options={activityLevelOptions}
            value={activityLevel}
            onChange={handleLevelChange}
            name="activityLevel"
          />
        </div>

        {/* Selected summary */}
        {selectedActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-green-900 mb-2">Votre profil d'activités</h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>
                <strong>{selectedActivities.length}</strong> activité(s) sélectionnée(s)
              </p>
              <p>
                Rythme : <strong>{activityLevelOptions.find(o => o.value === activityLevel)?.label}</strong>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingStepWrapper>
  );
};

export default ActivitiesStep;
