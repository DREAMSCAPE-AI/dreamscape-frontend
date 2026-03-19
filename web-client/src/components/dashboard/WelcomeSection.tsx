import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Booking } from '@/services/dashboard';

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
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, upcomingTrips, onRefresh }) => {
  const { t, i18n } = useTranslation('dashboard');
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  const defaultTrip = {
    destination: 'Paris, France',
    departureDate: '2024-03-15',
    returnDate: '2024-03-22',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80',
  };

  const displayTrip = nextTrip || defaultTrip;
  const userName = user?.name?.split(' ')[0] || 'Traveler';

  const formatDateRange = (departure: string, returnDate?: string) => {
    const depDate = new Date(departure);
    const retDate = returnDate ? new Date(returnDate) : null;
    if (retDate) {
      return `${depDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${retDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return depDate.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysUntilTrip = nextTrip
    ? Math.max(0, Math.ceil((new Date(nextTrip.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-glass border border-surface-200/50">
      <div className="flex flex-col md:flex-row">
        {/* Left: Text content */}
        <div className="flex-1 p-5 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold tracking-[0.1em] uppercase text-orange-500">
              {t('welcome.greeting', { name: '' }).replace(', !', '').replace(', ', '').trim() || 'Welcome back'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-surface-900 mb-3">
            {userName}
            <span className="text-gradient">,</span>{' '}
            <span className="text-gradient">
              {nextTrip ? t('welcome.nextAdventure')?.replace('Your next adventure awaits!', 'ready to travel?').replace('Votre prochaine aventure vous attend !', 'prêt à voyager ?') || 'ready to travel?' : t('welcome.readyForAdventure')?.replace("Ready for your next adventure?", "let's plan something.").replace("Prêt pour votre prochaine aventure ?", "planifions quelque chose.") || "let's plan something."}
            </span>
          </h1>

          {nextTrip ? (
            <div className="space-y-3 mt-4">
              {/* Trip info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-surface-900">{nextTrip.destination}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>{formatDateRange(nextTrip.departureDate, nextTrip.returnDate)}</span>
                </div>
              </div>

              {/* Countdown + status */}
              <div className="flex flex-wrap items-center gap-3">
                {daysUntilTrip !== null && daysUntilTrip > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/15 text-orange-600 text-xs font-semibold rounded-full">
                    {daysUntilTrip} {daysUntilTrip === 1 ? 'day' : 'days'} to go
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-100 text-gray-600 text-xs font-medium rounded-full capitalize">
                  {nextTrip.status}
                </span>
                <span className="text-sm font-bold text-surface-900">
                  ${nextTrip.totalAmount} {nextTrip.currency}
                </span>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                aria-label={t('welcome.viewItinerary')}
              >
                {t('welcome.viewItinerary')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              <p className="text-sm text-gray-500">{t('welcome.exploreDestinations')}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                aria-label={t('welcome.startPlanning')}
              >
                {t('welcome.startPlanning')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          {upcomingTrips.length > 1 && (
            <p className="mt-4 text-xs text-gray-400">
              +{upcomingTrips.length - 1} {t('welcome.upcomingTrips', { count: upcomingTrips.length - 1 })}
            </p>
          )}
        </div>

        {/* Right: Destination image */}
        <div className="hidden md:block relative w-72 lg:w-96">
          <img
            src={nextTrip?.details?.image || defaultTrip.image}
            alt={displayTrip.destination}
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
