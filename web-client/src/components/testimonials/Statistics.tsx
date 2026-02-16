import React from 'react';
import { useTranslation } from 'react-i18next';

const Statistics = () => {
  const { t } = useTranslation('common');

  const stats = [
    { id: '1', value: '50K+', labelKey: 'home.stats.travelersServed' },
    { id: '2', value: '100+', labelKey: 'home.stats.destinations' },
    { id: '3', value: '4.9', labelKey: 'home.stats.averageRating' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
      {stats.map((stat) => (
        <div key={stat.id} className="text-center">
          <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
            {stat.value}
          </div>
          <p className="text-gray-400 mt-2">{t(stat.labelKey)}</p>
        </div>
      ))}
    </div>
  );
};

export default Statistics;
