import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plane, Hotel, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onQuickSearch: (type: 'flight' | 'hotel' | 'activity', params: any) => Promise<any[]>;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickSearch }) => {
  const { t } = useTranslation('dashboard');
  const [searchType, setSearchType] = useState<'flight' | 'hotel' | 'activity'>('flight');
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleQuickSearch = async () => {
    if (!searchParams.destination) return;

    setIsSearching(true);
    try {
      const results = await onQuickSearch(searchType, searchParams);
      console.log('Quick search results:', results);
    } catch (error) {
      console.error('Quick search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchTypes = [
    { type: 'flight' as const, icon: Plane, label: t('quickActions.searchTypes.flights') },
    { type: 'hotel' as const, icon: Hotel, label: t('quickActions.searchTypes.hotels') },
    { type: 'activity' as const, icon: MapPin, label: t('quickActions.searchTypes.activities') }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-3 md:p-4 lg:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Search className="w-5 h-5 flex-shrink-0 text-orange-500" />
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-surface-900">{t('quickActions.title')}</h2>
      </div>

      {/* Search Type Selector */}
      <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
        {searchTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 min-h-[44px] transition-all ${
              searchType === type
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25'
                : 'bg-surface-100 text-surface-900 border border-surface-200/50 rounded-xl hover:bg-surface-200/50'
            }`}
            aria-pressed={searchType === type}
            aria-label={`${t('quickActions.searchTypes.select')} ${label}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm md:text-base">{label}</span>
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {searchType === 'flight' && (
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-gray-500 mb-1">{t('quickActions.form.from')}</label>
            <input
              type="text"
              placeholder={t('quickActions.form.placeholders.origin')}
              value={searchParams.origin}
              onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base bg-surface-100 border border-surface-200/50 rounded-xl text-surface-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
              aria-label={t('quickActions.form.from')}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-gray-500 mb-1">
            {searchType === 'flight' ? t('quickActions.form.to') : searchType === 'hotel' ? t('quickActions.form.destination') : t('quickActions.form.location')}
          </label>
          <input
            type="text"
            placeholder={searchType === 'flight' ? t('quickActions.form.placeholders.destination') : searchType === 'hotel' ? t('quickActions.form.placeholders.hotel') : t('quickActions.form.placeholders.activity')}
            value={searchParams.destination}
            onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base bg-surface-100 border border-surface-200/50 rounded-xl text-surface-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
            aria-label={searchType === 'flight' ? t('quickActions.form.to') : searchType === 'hotel' ? t('quickActions.form.destination') : t('quickActions.form.location')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-gray-500 mb-1">
            {searchType === 'activity' ? t('quickActions.form.date') : t('quickActions.form.departure')}
          </label>
          <input
            type="date"
            value={searchParams.departureDate}
            onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
            className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base bg-surface-100 border border-surface-200/50 rounded-xl text-surface-900 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
            aria-label={searchType === 'activity' ? t('quickActions.form.date') : t('quickActions.form.departure')}
          />
        </div>

        {searchType !== 'activity' && (
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-gray-500 mb-1">
              {searchType === 'flight' ? t('quickActions.form.return') : t('quickActions.form.checkOut')}
            </label>
            <input
              type="date"
              value={searchParams.returnDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
              className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base bg-surface-100 border border-surface-200/50 rounded-xl text-surface-900 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
              aria-label={searchType === 'flight' ? t('quickActions.form.return') : t('quickActions.form.checkOut')}
            />
          </div>
        )}
      </div>

      {/* Additional Options */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold tracking-[0.08em] uppercase text-gray-500 whitespace-nowrap">
            {searchType === 'flight' ? t('quickActions.form.passengers') : searchType === 'hotel' ? t('quickActions.form.guests') : t('quickActions.form.people')}:
          </label>
          <select
            value={searchParams.passengers}
            onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
            className="px-3 py-2 min-h-[44px] text-sm md:text-base bg-surface-100 border border-surface-200/50 rounded-xl text-surface-900 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
            aria-label={searchType === 'flight' ? t('quickActions.form.passengers') : searchType === 'hotel' ? t('quickActions.form.guests') : t('quickActions.form.people')}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleQuickSearch}
          disabled={!searchParams.destination || isSearching}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 min-h-[48px] text-sm md:text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-shadow"
          aria-label={isSearching ? t('quickActions.form.searching') : t('quickActions.form.search')}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{isSearching ? t('quickActions.form.searching') : t('quickActions.form.search')}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default QuickActions;
