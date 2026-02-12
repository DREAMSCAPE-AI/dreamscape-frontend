import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plane, Hotel, MapPin } from 'lucide-react';

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
      // Handle results - could open a modal or navigate to results page
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
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Search className="w-5 h-5 flex-shrink-0 text-orange-500" />
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">{t('quickActions.title')}</h2>
      </div>

      {/* Search Type Selector */}
      <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
        {searchTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 min-h-[44px] rounded-lg transition-colors ${
              searchType === type
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('quickActions.form.from')}</label>
            <input
              type="text"
              placeholder={t('quickActions.form.placeholders.origin')}
              value={searchParams.origin}
              onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              aria-label={t('quickActions.form.from')}
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {searchType === 'flight' ? t('quickActions.form.to') : searchType === 'hotel' ? t('quickActions.form.destination') : t('quickActions.form.location')}
          </label>
          <input
            type="text"
            placeholder={searchType === 'flight' ? t('quickActions.form.placeholders.destination') : searchType === 'hotel' ? t('quickActions.form.placeholders.hotel') : t('quickActions.form.placeholders.activity')}
            value={searchParams.destination}
            onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            aria-label={searchType === 'flight' ? t('quickActions.form.to') : searchType === 'hotel' ? t('quickActions.form.destination') : t('quickActions.form.location')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {searchType === 'activity' ? t('quickActions.form.date') : t('quickActions.form.departure')}
          </label>
          <input
            type="date"
            value={searchParams.departureDate}
            onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
            className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            aria-label={searchType === 'activity' ? t('quickActions.form.date') : t('quickActions.form.departure')}
          />
        </div>

        {searchType !== 'activity' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {searchType === 'flight' ? t('quickActions.form.return') : t('quickActions.form.checkOut')}
            </label>
            <input
              type="date"
              value={searchParams.returnDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
              className="w-full px-3 py-2.5 min-h-[44px] text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              aria-label={searchType === 'flight' ? t('quickActions.form.return') : t('quickActions.form.checkOut')}
            />
          </div>
        )}
      </div>

      {/* Additional Options */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
            {searchType === 'flight' ? t('quickActions.form.passengers') : searchType === 'hotel' ? t('quickActions.form.guests') : t('quickActions.form.people')}:
          </label>
          <select
            value={searchParams.passengers}
            onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
            className="px-3 py-2 min-h-[44px] text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            aria-label={searchType === 'flight' ? t('quickActions.form.passengers') : searchType === 'hotel' ? t('quickActions.form.guests') : t('quickActions.form.people')}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleQuickSearch}
          disabled={!searchParams.destination || isSearching}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 min-h-[48px] text-sm md:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label={isSearching ? t('quickActions.form.searching') : t('quickActions.form.search')}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{isSearching ? t('quickActions.form.searching') : t('quickActions.form.search')}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
