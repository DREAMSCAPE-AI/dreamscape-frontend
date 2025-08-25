import React from 'react';
import { Sliders, Star, Tag, Wifi, School as Pool, Space as Spa, Coffee } from 'lucide-react';

interface FiltersProps {
  filters: {
    budget: [number, number];
    type: string[];
    amenities: string[];
    rating: number;
  };
  onChange: (filters: FiltersProps['filters']) => void;
}

const SearchFilters: React.FC<FiltersProps> = ({ filters, onChange }) => {
  const amenitiesList = [
    { icon: Wifi, label: 'Wi-Fi' },
    { icon: Pool, label: 'Pool' },
    { icon: Spa, label: 'Spa' },
    { icon: Coffee, label: 'Restaurant' }
  ];

  const experienceTypes = [
    'Adventure',
    'Cultural',
    'Relaxation',
    'Urban',
    'Nature',
    'Beach'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      {/* Budget Range */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Budget Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.budget[1]}
            onChange={(e) => onChange({
              ...filters,
              budget: [filters.budget[0], parseInt(e.target.value)]
            })}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${filters.budget[0]}</span>
            <span>${filters.budget[1]}</span>
          </div>
        </div>
      </div>

      {/* Experience Type */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Experience Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {experienceTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                const newTypes = filters.type.includes(type)
                  ? filters.type.filter(t => t !== type)
                  : [...filters.type, type];
                onChange({ ...filters, type: newTypes });
              }}
              className={`px-3 py-2 rounded-lg text-sm ${
                filters.type.includes(type)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } transition-colors`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Minimum Rating</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => onChange({ ...filters, rating })}
              className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                filters.rating >= rating
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } transition-colors`}
            >
              <Star className={`w-5 h-5 ${filters.rating >= rating ? 'fill-current' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Amenities</h3>
        <div className="space-y-2">
          {amenitiesList.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => {
                const newAmenities = filters.amenities.includes(label)
                  ? filters.amenities.filter(a => a !== label)
                  : [...filters.amenities, label];
                onChange({ ...filters, amenities: newAmenities });
              }}
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg ${
                filters.amenities.includes(label)
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } transition-colors`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;