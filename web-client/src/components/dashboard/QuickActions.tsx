import React, { useState } from 'react';
import { Search, Plane, Hotel, MapPin } from 'lucide-react';

interface QuickActionsProps {
  onQuickSearch: (type: 'flight' | 'hotel' | 'activity', params: any) => Promise<any[]>;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickSearch }) => {
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
    { type: 'flight' as const, icon: Plane, label: 'Flights' },
    { type: 'hotel' as const, icon: Hotel, label: 'Hotels' },
    { type: 'activity' as const, icon: MapPin, label: 'Activities' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-800">Quick Search</h2>
      </div>

      {/* Search Type Selector */}
      <div className="flex gap-2 mb-6">
        {searchTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              searchType === type
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {searchType === 'flight' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="text"
              placeholder="Origin city"
              value={searchParams.origin}
              onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {searchType === 'flight' ? 'To' : searchType === 'hotel' ? 'Destination' : 'Location'}
          </label>
          <input
            type="text"
            placeholder={searchType === 'flight' ? 'Destination city' : searchType === 'hotel' ? 'City or hotel name' : 'Activity location'}
            value={searchParams.destination}
            onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {searchType === 'activity' ? 'Date' : 'Departure'}
          </label>
          <input
            type="date"
            value={searchParams.departureDate}
            onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {searchType !== 'activity' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {searchType === 'flight' ? 'Return' : 'Check-out'}
            </label>
            <input
              type="date"
              value={searchParams.returnDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Additional Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {searchType === 'flight' ? 'Passengers' : searchType === 'hotel' ? 'Guests' : 'People'}:
            </label>
            <select
              value={searchParams.passengers}
              onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleQuickSearch}
          disabled={!searchParams.destination || isSearching}
          className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Search className="w-4 h-4" />
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
