import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 text-white">
      <div className="absolute inset-0">
        <img
          src={nextTrip?.details?.image || defaultTrip.image}
          alt={displayTrip.destination}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 opacity-90" />
      </div>
      
      <div className="relative p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('welcome.greeting', { name: userName })}</h1>
            {nextTrip ? (
              <div>
                <p className="text-orange-100 mb-4">{t('welcome.nextAdventure')}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{nextTrip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDateRange(nextTrip.departureDate, nextTrip.returnDate)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-sm text-orange-100">
                    {t('welcome.status')}: <span className="font-semibold capitalize">{nextTrip.status}</span>
                  </span>
                  <span className="text-sm text-orange-100">
                    {t('welcome.total')}: <span className="font-semibold">${nextTrip.totalAmount}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-orange-100 mb-4">{t('welcome.readyForAdventure')}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{t('welcome.exploreDestinations')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{t('welcome.planTrip')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={t('welcome.refreshTrips')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="px-6 py-2 bg-white text-orange-500 rounded-lg hover:bg-orange-50 transition-colors">
              {nextTrip ? t('welcome.viewItinerary') : t('welcome.startPlanning')}
            </button>
          </div>
        </div>

        {upcomingTrips.length > 1 && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-orange-100 text-sm">
              {t('welcome.upcomingTrips', { count: upcomingTrips.length })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeSection;