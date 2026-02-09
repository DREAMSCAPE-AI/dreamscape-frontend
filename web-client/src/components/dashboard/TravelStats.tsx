import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, MapPin, DollarSign, Calendar, Plane, Award } from 'lucide-react';
import { UserStats } from '../../services/dashboardService';

interface TravelStatsProps {
  stats: UserStats | null;
}

const TravelStats: React.FC<TravelStatsProps> = ({ stats }) => {
  const { t } = useTranslation('dashboard');
  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('stats.title')}</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    {
      icon: Plane,
      label: t('stats.totalTrips'),
      value: stats.totalBookings.toString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: DollarSign,
      label: t('stats.totalSpent'),
      value: `$${stats.totalSpent.toLocaleString()}`,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: MapPin,
      label: t('stats.countriesVisited'),
      value: stats.countriesVisited.toString(),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Calendar,
      label: t('stats.avgTripDuration'),
      value: t('stats.days', { count: stats.averageTripDuration }),
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: TrendingUp,
      label: t('stats.upcomingTrips'),
      value: stats.upcomingTrips.toString(),
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Award,
      label: t('stats.favoriteDestination'),
      value: stats.favoriteDestination || t('stats.notSet'),
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">{t('stats.title')}</h3>
      </div>

      <div className="space-y-4">
        {statItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="font-semibold text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress towards next milestone */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{t('stats.milestone.title')}</span>
          <span className="text-sm text-gray-500">{stats.totalBookings}/10 {t('stats.milestone.trips')}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((stats.totalBookings / 10) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {10 - stats.totalBookings > 0
            ? t('stats.milestone.remaining', { count: 10 - stats.totalBookings })
            : t('stats.milestone.unlocked')
          }
        </p>
      </div>
    </div>
  );
};

export default TravelStats;
