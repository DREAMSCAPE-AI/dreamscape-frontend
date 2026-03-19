import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, MapPin, DollarSign, Calendar, Plane, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserStats } from '@/services/dashboard';

interface TravelStatsProps {
  stats: UserStats | null;
}

const TravelStats: React.FC<TravelStatsProps> = ({ stats }) => {
  const { t } = useTranslation('dashboard');

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5">
        <h3 className="text-lg font-bold tracking-tight text-surface-900 mb-4">{t('stats.title')}</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-surface-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    { icon: Plane, label: t('stats.totalTrips'), value: stats.totalBookings.toString() },
    { icon: DollarSign, label: t('stats.totalSpent'), value: `$${stats.totalSpent.toLocaleString()}` },
    { icon: MapPin, label: t('stats.countriesVisited'), value: stats.countriesVisited.toString() },
    { icon: Calendar, label: t('stats.avgTripDuration'), value: t('stats.days', { count: stats.averageTripDuration }) },
    { icon: TrendingUp, label: t('stats.upcomingTrips'), value: stats.upcomingTrips.toString() },
    { icon: Award, label: t('stats.favoriteDestination'), value: stats.favoriteDestination || t('stats.notSet') }
  ];

  const milestoneProgress = Math.min((stats.totalBookings / 10) * 100, 100);

  return (
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-bold tracking-tight text-surface-900">{t('stats.title')}</h3>
      </div>

      {/* Featured stat */}
      <div className="mb-5 p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border border-orange-100/50">
        <p className="text-xs font-semibold tracking-[0.08em] uppercase text-orange-500/70 mb-1">{t('stats.totalTrips')}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-surface-900">{stats.totalBookings}</span>
          <span className="text-sm text-gray-400">trips</span>
        </div>
      </div>

      {/* Other stats */}
      <div className="space-y-3">
        {statItems.slice(1).map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 bg-surface-100 rounded-lg flex-shrink-0">
                <item.icon className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500 truncate">{item.label}</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-surface-900 flex-shrink-0 ml-2">{item.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Milestone progress */}
      <div className="mt-5 pt-5 border-t border-surface-200/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500">{t('stats.milestone.title')}</span>
          <span className="text-xs font-bold text-surface-900">{stats.totalBookings}/10</span>
        </div>
        <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={stats.totalBookings} aria-valuemin={0} aria-valuemax={10}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${milestoneProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
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
