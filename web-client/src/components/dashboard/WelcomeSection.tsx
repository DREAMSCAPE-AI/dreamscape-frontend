import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';
import { Booking } from '../../services/dashboardService';

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

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, upcomingTrips, onRefresh, userCategory }) => {
  const { t, i18n } = useTranslation('dashboard');
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  
  // Default trip for demo purposes
  const defaultTrip = {
    destination: 'Paris, France',
    departureDate: '2024-03-15',
    returnDate: '2024-03-22',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80',
  };

  const displayTrip = nextTrip || defaultTrip;
  const userName = user?.name || 'Traveler';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (departure: string, returnDate?: string) => {
    const depDate = new Date(departure);
    const retDate = returnDate ? new Date(returnDate) : null;

    if (retDate) {
      return `${depDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${retDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return formatDate(departure);
  };

  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 text-white">
      <div className="absolute inset-0">
        <img
          src={nextTrip?.details?.image || defaultTrip.image}
          alt={displayTrip.destination}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 opacity-90" />
      </div>

      <div className="relative p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('welcome.greeting', { name: userName })}</h1>
            {nextTrip ? (
              <div>
                <p className="text-orange-100 text-sm md:text-base mb-3 md:mb-4">{t('welcome.nextAdventure')}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{nextTrip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{formatDateRange(nextTrip.departureDate, nextTrip.returnDate)}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="text-xs md:text-sm text-orange-100">
                    {t('welcome.status')}: <span className="font-semibold capitalize">{nextTrip.status}</span>
                  </span>
                  <span className="text-xs md:text-sm text-orange-100">
                    {t('welcome.total')}: <span className="font-semibold">${nextTrip.totalAmount}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-orange-100 text-sm md:text-base mb-3 md:mb-4">{t('welcome.readyForAdventure')}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{t('welcome.exploreDestinations')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{t('welcome.planTrip')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onRefresh}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={t('welcome.refreshTrips')}
              aria-label={t('welcome.refreshTrips')}
            >
              <RefreshCw className="w-4 h-4 flex-shrink-0" />
            </button>
            <button
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 min-h-[44px] text-sm md:text-base font-medium bg-white text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label={nextTrip ? t('welcome.viewItinerary') : t('welcome.startPlanning')}
            >
              <span className="hidden sm:inline">{nextTrip ? t('welcome.viewItinerary') : t('welcome.startPlanning')}</span>
              <span className="sm:hidden">{nextTrip ? t('welcome.viewItineraryShort') : t('welcome.startPlanningShort')}</span>
            </button>
          </div>
        </div>

        {upcomingTrips.length > 1 && (
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/20">
            <p className="text-orange-100 text-xs md:text-sm">
              {t('welcome.upcomingTrips', { count: upcomingTrips.length })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeSection;