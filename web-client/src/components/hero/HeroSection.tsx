import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plane, Building2, Calendar, Users, Search, MapPin } from 'lucide-react';
import SearchBox from './SearchBox';
import BackgroundOverlay from './BackgroundOverlay';

interface HeroSectionProps {
  onDashboardClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDashboardClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [searchType, setSearchType] = useState<'destination' | 'flight' | 'hotel'>('destination');
  const [searchParams, setSearchParams] = useState({
    location: '',
    dates: {
      startDate: null as Date | null,
      endDate: null as Date | null
    },
    guests: 2
  });

  const handleSearch = () => {
    switch (searchType) {
      case 'flight':
        navigate('/flights', { state: searchParams });
        break;
      case 'hotel':
        navigate('/search', { 
          state: { 
            ...searchParams,
            type: 'hotel'
          }
        });
        break;
      default:
        navigate('/search', { state: searchParams });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh+80px)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?auto=format&fit=crop&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          <BackgroundOverlay />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-center pt-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
          {t('hero.title')}<br />{t('hero.titleLine2')}
        </h1>

        <p className="text-xl md:text-2xl mb-12 max-w-2xl text-cyan-100">
          {t('hero.subtitle')}
        </p>
        
        <div className="space-y-6 max-w-4xl">
          {/* Search Type Selector */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-md p-1 rounded-lg w-fit">
            {[
              { type: 'destination', label: t('nav.destinations'), icon: MapPin },
              { type: 'flight', label: t('nav.flights'), icon: Plane },
              { type: 'hotel', label: t('nav.hotels'), icon: Building2 }
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setSearchType(type as typeof searchType)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  searchType === type
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location Input */}
              <div className="md:col-span-2">
                <label className="block text-white text-sm mb-2">
                  {searchType === 'flight' ? t('hero.whereTo') : t('hero.location')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      searchType === 'flight'
                        ? t('hero.placeholderFlight')
                        : searchType === 'hotel'
                        ? t('hero.placeholderHotel')
                        : t('hero.placeholderDestination')
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-white text-sm mb-2">{t('hero.dates')}</label>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
                  <Calendar className="w-5 h-5 text-white/70" />
                  <span>{t('hero.selectDates')}</span>
                </button>
              </div>

              {/* Guests/Travelers */}
              <div>
                <label className="block text-white text-sm mb-2">
                  {searchType === 'flight' ? t('hero.travelers') : t('hero.guests')}
                </label>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
                  <Users className="w-5 h-5 text-white/70" />
                  <span>{searchParams.guests} {searchParams.guests === 1 ? t('hero.person') : t('hero.people')}</span>
                </button>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Search className="w-5 h-5" />
              <span>
                {searchType === 'flight'
                  ? t('hero.searchFlights')
                  : searchType === 'hotel'
                  ? t('hero.findHotels')
                  : t('hero.exploreDestinations')}
              </span>
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/planner')}
              className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              {t('hero.planYourTrip')}
            </button>
            {onDashboardClick && (
              <button
                onClick={onDashboardClick}
                className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                {t('hero.accessDashboard')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;