import React from 'react';
import { Search, MapPin, Clock } from 'lucide-react';

export interface ActivitySearchParams {
  location: string;
  category: string;
  priceRange: { min: number; max: number };
  duration: string;
}

interface ActivitySearchProps {
  onSearch: (params: ActivitySearchParams) => void;
  loading?: boolean;
  error?: string | null;
}

const ActivitySearch: React.FC<ActivitySearchProps> = ({
  onSearch,
  loading = false,
  error = null
}) => {
  const [selectedLocation, setSelectedLocation] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedDuration, setSelectedDuration] = React.useState('all');
  const [priceRange, setPriceRange] = React.useState({ min: 0, max: 1000 });

  const categories = [
    { id: 'all', name: 'All Activities' },
    { id: 'SIGHTSEEING', name: 'Sightseeing' },
    { id: 'ATTRACTION', name: 'Attractions' },
    { id: 'TOUR', name: 'Tours' },
    { id: 'MUSEUM', name: 'Museums' },
    { id: 'ENTERTAINMENT', name: 'Entertainment' },
    { id: 'ADVENTURE', name: 'Adventure' },
    { id: 'CULTURAL', name: 'Cultural' },
    { id: 'FOOD_AND_DRINK', name: 'Food & Drink' },
    { id: 'NATURE', name: 'Nature' },
    { id: 'WELLNESS', name: 'Wellness' }
  ];

  // Amadeus Test API supported cities
  const testApiSupportedCities = [
    'Paris', 'London', 'Barcelona', 'Berlin',
    'New York', 'San Francisco', 'Dallas', 'Bangalore'
  ];

  // Additional cities (NOT supported in test)
  const otherCities = [
    'Tokyo', 'Dubai', 'Bangkok', 'Rome', 'Amsterdam', 'Singapore'
  ];

  const durations = [
    { id: 'all', name: 'Any Duration' },
    { id: 'short', name: 'Short (< 2 hours)', maxHours: 2 },
    { id: 'medium', name: 'Medium (2-4 hours)', minHours: 2, maxHours: 4 },
    { id: 'long', name: 'Long (4-8 hours)', minHours: 4, maxHours: 8 },
    { id: 'full-day', name: 'Full Day (8+ hours)', minHours: 8 }
  ];

  const handleSearch = () => {
    onSearch({
      location: selectedLocation,
      category: selectedCategory,
      priceRange,
      duration: selectedDuration
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Find Your Activity</h2>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white border border-gray-200"
            >
              <option value="">All Locations (8 cities)</option>
              <optgroup label="✅ Test API Supported Cities">
                {testApiSupportedCities.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </optgroup>
              <optgroup label="⚠️ Other Cities (Limited Test Data)">
                {otherCities.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Type
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white border border-gray-200"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white border border-gray-200"
            >
              {durations.map(duration => (
                <option key={duration.id} value={duration.id}>
                  {duration.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">${priceRange.min}</span>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <span className="text-sm text-gray-600">${priceRange.max}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Search Activities</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ActivitySearch;
