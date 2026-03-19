import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Sparkles, Plane, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Booking } from '@/services/dashboard';
import { UserStats } from '@/services/dashboard';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  type?: 'business' | 'leisure' | 'bleisure';
  userCategory?: 'LEISURE' | 'BUSINESS';
}

interface WelcomeSectionProps {
  user: User | null;
  upcomingTrips: Booking[];
  onRefresh?: () => Promise<void>;
  userCategory?: 'LEISURE' | 'BUSINESS';
  stats?: UserStats | null;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, upcomingTrips, stats }) => {
  const { t, i18n } = useTranslation('dashboard');
  const navigate = useNavigate();
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  const defaultImage = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80';
  const userName = user?.name?.split(' ')[0] || 'Traveler';

  const formatDateRange = (departure: string, returnDate?: string) => {
    const depDate = new Date(departure);
    const retDate = returnDate ? new Date(returnDate) : null;
    if (retDate) {
      return `${depDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} — ${retDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return depDate.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysUntilTrip = nextTrip
    ? Math.max(0, Math.ceil((new Date(nextTrip.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Context-aware: use stats when no detailed trip data
  const upcomingCount = stats?.upcomingTrips || upcomingTrips.length;
  const hasTrips = nextTrip || upcomingCount > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-glass border border-surface-200/50">
      <div className="flex flex-col md:flex-row">
        {/* Left: Text content */}
        <div className="flex-1 p-5 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold tracking-[0.1em] uppercase text-orange-500">
              {t('welcome.greeting', { name: '' }).replace(/, ?!?$/, '').replace(/, ?$/, '').trim() || 'Welcome back'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-surface-900 mb-1">
            {userName}<span className="text-gradient">,</span>
          </h1>

          {nextTrip ? (
            /* Has a specific next trip with details */
            <div>
              <p className="text-lg text-gray-400 mb-4">your next trip is coming up.</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-surface-900">{nextTrip.destination}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>{formatDateRange(nextTrip.departureDate, nextTrip.returnDate)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {daysUntilTrip !== null && daysUntilTrip > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/15 text-orange-600 text-xs font-semibold rounded-full">
                    {daysUntilTrip} {daysUntilTrip === 1 ? 'day' : 'days'} to go
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-100 text-gray-500 text-xs font-medium rounded-full capitalize">
                  {nextTrip.status}
                </span>
                <span className="text-sm font-bold text-surface-900">${nextTrip.totalAmount}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/bookings/${nextTrip.id}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
              >
                {t('welcome.viewItinerary')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          ) : hasTrips ? (
            /* Has upcoming trips via stats but no detailed trip data */
            <div>
              <p className="text-lg text-gray-400 mb-4">you have {upcomingCount} upcoming {upcomingCount === 1 ? 'trip' : 'trips'}.</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/15 rounded-xl">
                  <Plane className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600">{upcomingCount} {upcomingCount === 1 ? 'trip' : 'trips'} planned</span>
                </div>
                {stats && stats.totalBookings > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-100 rounded-xl">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{stats.totalBookings} total bookings</span>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/bookings')}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
              >
                {t('welcome.viewTrips')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            /* No trips at all */
            <div>
              <p className="text-lg text-gradient font-medium mb-4">let's plan something.</p>
              <p className="text-sm text-gray-400 mb-4">{t('welcome.exploreDestinations')}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/planner')}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
              >
                {t('welcome.startPlanning')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Right: Destination image */}
        <div className="hidden md:block relative w-72 lg:w-96">
          <img
            src={nextTrip?.details?.image || defaultImage}
            alt="Destination"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent" />
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-pink-500 to-transparent" />
    </div>
  );
};

export default WelcomeSection;
