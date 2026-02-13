import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Sliders, X, Tag, Compass } from 'lucide-react';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import MapView from './MapView';
import VRPreview from '../destination/VRPreview';
import SearchSuggestions from './SearchSuggestions';

const AdvancedSearch = () => {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [showVR, setShowVR] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    location: '',
    dates: '',
    guests: 2,
    filters: {
      budget: [0, 1000],
      type: [] as string[],
      amenities: [] as string[],
      rating: 0
    }
  });

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    // Implement search logic
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 flex items-center gap-4 bg-gray-50 rounded-lg p-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Where would you like to go?"
                className="flex-1 bg-transparent outline-none"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              />
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Select dates"
                className="bg-transparent outline-none"
                value={searchParams.dates}
                onChange={(e) => setSearchParams({ ...searchParams, dates: e.target.value })}
              />
            </div>

            {/* Guests */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <Users className="w-5 h-5 text-gray-400" />
              <select
                className="bg-transparent outline-none"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({ ...searchParams, guests: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <Compass className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('map')}
                className={`p-2 rounded-lg transition-colors ${
                  view === 'map' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Smart Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['Popular', 'Best Value', 'Hidden Gems', 'Family Friendly', 'Adventure'].map((tag) => (
              <button
                key={tag}
                className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm hover:bg-orange-100 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 flex-shrink-0">
            <SearchFilters
              filters={searchParams.filters}
              onChange={(filters) => setSearchParams({ ...searchParams, filters })}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* AI Suggestions */}
            <SearchSuggestions location={searchParams.location} />

            {/* Results */}
            <div className="mt-6">
              {view === 'list' ? (
                <SearchResults onVRPreview={(id) => {
                  setSelectedDestination(id);
                  setShowVR(true);
                }} />
              ) : (
                <MapView />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VR Preview Modal */}
      <AnimatePresence>
        {showVR && selectedDestination && (
          <VRPreview
            destinationId={selectedDestination}
            onClose={() => {
              setShowVR(false);
              setSelectedDestination(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;