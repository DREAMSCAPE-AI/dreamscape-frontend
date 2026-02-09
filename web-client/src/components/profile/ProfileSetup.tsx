import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import UserTypeSelector from './UserTypeSelector';
import useProfileStore from '@/services/profile/ProfileStore';
import type { UserType } from '@/services/profile/types';

const ProfileSetup: React.FC = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const setProfile = useProfileStore((state) => state.setProfile);

  const handleSubmit = () => {
    if (!selectedType) return;

    setProfile({
      type: selectedType,
      preferences: {
        [selectedType]: selectedType === 'business'
          ? {
              expensePolicy: false,
              meetingSync: false,
              corporateRates: false,
            }
          : selectedType === 'leisure'
          ? {
              interests: [],
              travelStyle: [],
              budget: {
                min: 0,
                max: 5000,
                currency: 'USD',
              },
            }
          : {
              workDays: [],
              leisureDays: [],
              expenseSplit: false,
            },
      },
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{t('profile.setup.title', 'Personalize Your Experience')}</h1>
          <p className="text-gray-600 mb-8">
            {t('profile.setup.subtitle', 'Select your primary travel purpose to get personalized recommendations and features.')}
          </p>

          <UserTypeSelector
            selectedType={selectedType}
            onSelect={setSelectedType}
          />

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedType}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {t('profile.setup.continue', 'Continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;