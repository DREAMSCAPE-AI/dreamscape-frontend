import React, { useState } from 'react';
import { Compass, Calendar, DollarSign, Search } from 'lucide-react';
import { useExperienceSearch } from '../../hooks/useAPI';
import Calendar from '../shared/Calendar';
import Dropdown from '../shared/Dropdown';
import type { ExperienceSearchParams } from '../../services/api/types';

const ExperienceSearch = () => {
  const { searchExperiences, loading, error } = useExperienceSearch();
  const [searchParams, setSearchParams] = useState<ExperienceSearchParams>({
    location: '',
    category: '',
    date: ''
  });

  const categories = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'nature', label: 'Nature' },
    { value: 'wellness', label: 'Wellness' }
  ];

  const handleSearch = async () => {
    try {
      const results = await searchExperiences(searchParams);
      // Handle results
    } catch (error) {
      console.error('Experience search failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Discover Experiences</h2>
      
      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Where do you want to explore?"
              value={searchParams.location}
              onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Dropdown
              options={categories}
              value={searchParams.category || ''}
              onChange={(value) => setSearchParams({ ...searchParams, category: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Calendar
              onSelect={(date) => setSearchParams({
                ...searchParams,
                date: date.toISOString()
              })}
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="1000"
              className="w-full"
              onChange={(e) => setSearchParams({
                ...searchParams,
                priceRange: {
                  min: 0,
                  max: parseInt(e.target.value)
                }
              })}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>$0</span>
              <span>$1000+</span>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Find Experiences</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceSearch;