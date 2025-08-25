import React, { useState } from 'react';
import { Home, Calendar, Wifi, DollarSign, Star, MapPin, Users, Shield } from 'lucide-react';

interface LongTermStaysProps {
  accommodations: Accommodation[];
  onBook: (accommodation: Accommodation) => void;
  onContact: (accommodation: Accommodation) => void;
}

interface Accommodation {
  id: string;
  title: string;
  type: 'apartment' | 'house' | 'coliving' | 'hotel';
  location: string;
  rating: number;
  pricePerMonth: number;
  currency: string;
  minStay: number;
  maxStay?: number;
  amenities: string[];
  images: string[];
  wifiSpeed: number;
  reviews: number;
  availability: {
    from: string;
    to: string;
  };
}

const LongTermStays: React.FC<LongTermStaysProps> = ({
  accommodations,
  onBook,
  onContact
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  const types = [
    { id: 'all', label: 'All Types', icon: Home },
    { id: 'apartment', label: 'Apartments', icon: Building },
    { id: 'coliving', label: 'Co-living', icon: Users },
    { id: 'hotel', label: 'Apart-hotels', icon: Building2 }
  ];

  const filteredAccommodations = accommodations.filter(acc => 
    (selectedType === 'all' || acc.type === selectedType) &&
    acc.pricePerMonth >= minPrice &&
    acc.pricePerMonth <= maxPrice
  );

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accommodation Type
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedType === type.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Budget
            </label>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

          {/* Stay Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length of Stay
            </label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20">
              <option value="1-3">1-3 months</option>
              <option value="3-6">3-6 months</option>
              <option value="6-12">6-12 months</option>
              <option value="12+">12+ months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAccommodations.map((accommodation) => (
          <div
            key={accommodation.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={accommodation.images[0]}
                alt={accommodation.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              
              {/* WiFi Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm flex items-center gap-1">
                <Wifi className="w-4 h-4" />
                <span>{accommodation.wifiSpeed} Mbps</span>
              </div>

              {/* Rating */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-sm flex items-center gap-1">
                <Star className="w-4 h-4 text-orange-400" />
                <span>{accommodation.rating} ({accommodation.reviews})</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{accommodation.title}</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-500">per month</div>
                  <div className="text-xl font-bold">
                    {accommodation.currency} {accommodation.pricePerMonth}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{accommodation.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{accommodation.minStay}+ months</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {accommodation.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onContact(accommodation)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Contact Host
                </button>
                <button
                  onClick={() => onBook(accommodation)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LongTermStays;