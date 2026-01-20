import React, { useState, useMemo, useCallback } from 'react';
import { Star, MapPin, Wifi, Building2, Shield, Filter, SortAsc, Heart, Eye, Car, Utensils, Waves, Dumbbell } from 'lucide-react';
import type { HotelOffer } from '../../services/api/types';
import { useHistoryTracking } from '@/hooks/useHistoryTracking';

interface HotelResultsProps {
  hotels: HotelOffer[];
  onSelect: (hotel: HotelOffer) => void;
  loading?: boolean;
}

type SortOption = 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance';

const HotelResults: React.FC<HotelResultsProps> = React.memo(({ hotels = [], onSelect, loading = false }) => {
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 1000,
    amenities: [] as string[],
    freeCancellation: false
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // History tracking hook
  const { trackHotelView, trackHotelFavorite, trackHotelUnfavorite } = useHistoryTracking();

  // Memoize the sorting and filtering logic to prevent unnecessary recalculations
  const sortedAndFilteredHotels = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];
    
    let filtered = hotels.filter(hotel => {
      // Rating filter
      if (filters.minRating > 0 && parseInt(hotel.rating) < filters.minRating) {
        return false;
      }
      
      // Price filter
      const price = parseFloat(hotel.price?.total || '0');
      if (price > filters.maxPrice) {
        return false;
      }
      
      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasRequiredAmenities = filters.amenities.every(amenity => 
          hotel.amenities?.includes(amenity)
        );
        if (!hasRequiredAmenities) {
          return false;
        }
      }
      
      // Free cancellation filter
      if (filters.freeCancellation) {
        const hasFreeCancel = hotel.policies?.some(policy => 
          policy.type === 'CANCELLATION' && 
          policy.description.text.toLowerCase().includes('free')
        );
        if (!hasFreeCancel) {
          return false;
        }
      }
      
      return true;
    });

    // Sort hotels
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.price?.total || '0') - parseFloat(b.price?.total || '0');
        case 'price_high':
          return parseFloat(b.price?.total || '0') - parseFloat(a.price?.total || '0');
        case 'rating':
          return parseInt(b.rating) - parseInt(a.rating);
        case 'distance':
          // Placeholder for distance sorting - would need coordinates
          return 0;
        case 'recommended':
        default:
          // Combine rating and price for recommendation score
          const scoreA = parseInt(a.rating) * 0.7 + (1000 - parseFloat(a.price?.total || '0')) * 0.3;
          const scoreB = parseInt(b.rating) * 0.7 + (1000 - parseFloat(b.price?.total || '0')) * 0.3;
          return scoreB - scoreA;
      }
    });
  }, [hotels, sortBy, filters]);

  // Use useCallback to prevent function recreation on every render
  const toggleFavorite = useCallback((hotelId: string, hotelName?: string) => {
    console.log('[HotelResults] toggleFavorite called:', { hotelId, hotelName });
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId);
        // Track unfavorite action
        console.log('[HotelResults] Tracking unfavorite');
        trackHotelUnfavorite(hotelId, hotelName);
      } else {
        newFavorites.add(hotelId);
        // Track favorite action
        console.log('[HotelResults] Tracking favorite');
        trackHotelFavorite(hotelId, hotelName);
      }
      return newFavorites;
    });
  }, [trackHotelFavorite, trackHotelUnfavorite]);

  const handleHotelSelect = useCallback((hotel: HotelOffer) => {
    console.log('[HotelResults] handleHotelSelect called:', { id: hotel.id, name: hotel.name });
    // Track hotel view action
    console.log('[HotelResults] Tracking hotel view');
    trackHotelView(hotel.id, hotel.name);
    onSelect(hotel);
  }, [onSelect, trackHotelView]);

  const getAmenityIcon = useCallback((amenity: string) => {
    switch (amenity) {
      case 'WIFI': return <Wifi className="w-4 h-4" />;
      case 'RESTAURANT': return <Utensils className="w-4 h-4" />;
      case 'BUSINESS_CENTER': return <Building2 className="w-4 h-4" />;
      case 'POOL': return <Waves className="w-4 h-4" />;
      case 'FITNESS_CENTER': return <Dumbbell className="w-4 h-4" />;
      case 'PARKING': return <Car className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  }, []);

  const formatAmenityName = useCallback((amenity: string) => {
    return amenity.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  // Memoize the filter update functions
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAmenityChange = useCallback((amenity: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={`skeleton-${index}`} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-80 h-64 bg-gray-200" />
              <div className="flex-1 p-6">
                <div className="h-6 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header with Sort and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-lg font-semibold text-gray-900">
            {sortedAndFilteredHotels.length} hotel{sortedAndFilteredHotels.length !== 1 ? 's' : ''} found
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Star Rating</option>
                <option value="distance">Distance</option>
              </select>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-orange-50 border-orange-200 text-orange-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => updateFilters({ minRating: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price per Night</label>
                <select
                  value={filters.maxPrice}
                  onChange={(e) => updateFilters({ maxPrice: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value={1000}>Any Price</option>
                  <option value={100}>Under $100</option>
                  <option value={200}>Under $200</option>
                  <option value={300}>Under $300</option>
                  <option value={500}>Under $500</option>
                </select>
              </div>
              
              {/* Amenities Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="space-y-1">
                  {['WIFI', 'POOL', 'PARKING', 'FITNESS_CENTER'].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500/20"
                      />
                      <span>{formatAmenityName(amenity)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Free Cancellation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Options</label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.freeCancellation}
                    onChange={(e) => updateFilters({ freeCancellation: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500/20"
                  />
                  <span>Free Cancellation</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hotel Results */}
      <div className="space-y-4">
        {sortedAndFilteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Image */}
              <div className="lg:w-80 relative group">
                <img
                  src={hotel.media?.[0]?.uri || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80'}
                  alt={hotel.name}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(hotel.id, hotel.name)}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.has(hotel.id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
                
                {/* Image Count */}
                {hotel.media && hotel.media.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-sm rounded-lg flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{hotel.media.length}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                      {/* Star Rating */}
                      <div className="flex items-center">
                        {[...Array(parseInt(hotel.rating))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{hotel.chainCode || 'Independent Hotel'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>City Location</span>
                      </div>
                    </div>

                    {/* Description */}
                    {hotel.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {hotel.description.text}
                      </p>
                    )}

                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.slice(0, 6).map((amenity, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm"
                          >
                            {getAmenityIcon(amenity)}
                            <span>{formatAmenityName(amenity)}</span>
                          </span>
                        ))}
                        {hotel.amenities.length > 6 && (
                          <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
                            +{hotel.amenities.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price and Booking */}
                  <div className="text-right ml-6">
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">From</div>
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-3xl font-bold text-orange-500">
                          {hotel.price?.currency} {hotel.price?.total}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleHotelSelect(hotel)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                      >
                        View Details
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Includes taxes & fees
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Footer */}
            <div className="px-6 py-3 bg-orange-50 border-t border-orange-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-orange-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>
                      {hotel.policies?.find(p => p.type === 'CANCELLATION')?.description.text || 
                       'Flexible booking options available'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">Available</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* No Results */}
        {sortedAndFilteredHotels.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hotels Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => updateFilters({
                minRating: 0,
                maxPrice: 1000,
                amenities: [],
                freeCancellation: false
              })}
              className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default HotelResults;