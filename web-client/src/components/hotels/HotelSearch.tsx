import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Users, Search, Minus, Plus, ChevronDown } from 'lucide-react';
import DateRangePicker from '../shared/DateRangePicker';
import voyageService from '../../services/api/VoyageService';
import type { HotelSearchParams } from '../../services/api/types';

interface HotelSearchProps {
  onSearch: (params: HotelSearchParams) => void;
  initialValues?: HotelSearchParams | null;
  loading?: boolean;
  error?: string | null;
}

interface LocationSuggestion {
  name: string;
  iataCode: string;
  address: {
    cityName: string;
    countryName: string;
  };
}

interface GuestConfiguration {
  adults: number;
  children: number;
  childAges: number[];
  rooms: number;
}

const HotelSearch: React.FC<HotelSearchProps> = ({
  onSearch,
  initialValues,
  loading = false,
  error = null
}) => {
  const [searchParams, setSearchParams] = useState<HotelSearchParams>({
    cityCode: initialValues?.cityCode || '',
    checkInDate: initialValues?.checkInDate || '',
    checkOutDate: initialValues?.checkOutDate || '',
    roomQuantity: initialValues?.roomQuantity || 1,
    adults: initialValues?.adults || 2,
    childAges: initialValues?.childAges || []
  });

  // Location autocomplete state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationTimeoutRef = useRef<number>();

  // Guest configuration state
  const [guestConfig, setGuestConfig] = useState<GuestConfiguration>({
    adults: initialValues?.adults || 2,
    children: initialValues?.childAges?.length || 0,
    childAges: initialValues?.childAges || [],
    rooms: initialValues?.roomQuantity || 1
  });
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const guestDropdownRef = useRef<HTMLDivElement>(null);

  // Property filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ratings: [] as string[],
    amenities: [] as string[],
    priceRange: ''
  });

  // Location search with debouncing
  useEffect(() => {
    if (locationQuery.length >= 2) {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
      
      locationTimeoutRef.current = window.setTimeout(async () => {
        setLocationLoading(true);
        try {
          const response = await voyageService.searchLocations({
            keyword: locationQuery,
            subType: 'CITY'
          });
          
          if (response.data) {
            setLocationSuggestions(response.data.slice(0, 8));
            setShowLocationSuggestions(true);
          }
        } catch (error) {
          console.error('Location search error:', error);
          setLocationSuggestions([]);
        } finally {
          setLocationLoading(false);
        }
      }, 300);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [locationQuery]);

  // Close guest dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setShowGuestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = ({ startDate, endDate }: { startDate: Date | null; endDate: Date | null }) => {
    // Format dates to YYYY-MM-DD format for Amadeus API
    // Use local timezone to avoid date shifting issues
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setSearchParams({
      ...searchParams,
      checkInDate: formatDate(startDate),
      checkOutDate: formatDate(endDate)
    });
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setLocationQuery(`${location.address.cityName}, ${location.address.countryName}`);
    setSearchParams({ ...searchParams, cityCode: location.iataCode });
    setShowLocationSuggestions(false);
  };

  const updateGuestCount = (type: 'adults' | 'children' | 'rooms', operation: 'increment' | 'decrement') => {
    const newConfig = { ...guestConfig };
    
    if (type === 'adults') {
      if (operation === 'increment' && newConfig.adults < 8) {
        newConfig.adults++;
      } else if (operation === 'decrement' && newConfig.adults > 1) {
        newConfig.adults--;
      }
    } else if (type === 'children') {
      if (operation === 'increment' && newConfig.children < 6) {
        newConfig.children++;
        newConfig.childAges.push(5); // Default age
      } else if (operation === 'decrement' && newConfig.children > 0) {
        newConfig.children--;
        newConfig.childAges.pop();
      }
    } else if (type === 'rooms') {
      if (operation === 'increment' && newConfig.rooms < 8) {
        newConfig.rooms++;
      } else if (operation === 'decrement' && newConfig.rooms > 1) {
        newConfig.rooms--;
      }
    }
    
    setGuestConfig(newConfig);
    setSearchParams({
      ...searchParams,
      adults: newConfig.adults,
      roomQuantity: newConfig.rooms,
      childAges: newConfig.childAges
    });
  };

  const updateChildAge = (index: number, age: number) => {
    const newChildAges = [...guestConfig.childAges];
    newChildAges[index] = age;
    setGuestConfig({ ...guestConfig, childAges: newChildAges });
    setSearchParams({ ...searchParams, childAges: newChildAges });
  };

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    const newFilters = { ...filters };
    
    if (filterType === 'ratings' || filterType === 'amenities') {
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      }
    } else if (filterType === 'priceRange') {
      newFilters.priceRange = value;
    }
    
    setFilters(newFilters);
    setSearchParams({
      ...searchParams,
      ratings: newFilters.ratings,
      amenities: newFilters.amenities,
      priceRange: newFilters.priceRange
    });
  };

  const handleSearch = () => {
    if (!searchParams.cityCode || !searchParams.checkInDate || !searchParams.checkOutDate) {
      return;
    }
    onSearch(searchParams);
  };

  const getGuestSummary = () => {
    const parts = [];
    parts.push(`${guestConfig.adults} Adult${guestConfig.adults > 1 ? 's' : ''}`);
    if (guestConfig.children > 0) {
      parts.push(`${guestConfig.children} Child${guestConfig.children > 1 ? 'ren' : ''}`);
    }
    parts.push(`${guestConfig.rooms} Room${guestConfig.rooms > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Find Your Perfect Stay</h2>
      
      <div className="space-y-6">
        {/* Location Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Where are you going?"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white border border-gray-200"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            {/* Location Suggestions */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                {locationSuggestions.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {location.address.cityName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {location.address.countryName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {locationLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in / Check-out
          </label>
          <DateRangePicker
            onChange={handleDateChange}
            value={{
              startDate: searchParams.checkInDate ? new Date(searchParams.checkInDate) : null,
              endDate: searchParams.checkOutDate ? new Date(searchParams.checkOutDate) : null
            }}
            minDate={new Date()}
          />
        </div>

        {/* Guests & Rooms */}
        <div className="relative" ref={guestDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guests & Rooms
          </label>
          <button
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white border border-gray-200 text-left flex items-center justify-between"
          >
            <span>{getGuestSummary()}</span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
          </button>
          <Users className="absolute left-3 top-10 w-5 h-5 text-gray-400" />
          
          {/* Guest Dropdown */}
          {showGuestDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 p-4">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Adults</div>
                    <div className="text-sm text-gray-500">Ages 18+</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateGuestCount('adults', 'decrement')}
                      disabled={guestConfig.adults <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{guestConfig.adults}</span>
                    <button
                      onClick={() => updateGuestCount('adults', 'increment')}
                      disabled={guestConfig.adults >= 8}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Children</div>
                    <div className="text-sm text-gray-500">Ages 0-17</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateGuestCount('children', 'decrement')}
                      disabled={guestConfig.children <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{guestConfig.children}</span>
                    <button
                      onClick={() => updateGuestCount('children', 'increment')}
                      disabled={guestConfig.children >= 6}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Child Ages */}
                {guestConfig.children > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Children's Ages</div>
                    <div className="grid grid-cols-3 gap-2">
                      {guestConfig.childAges.map((age, index) => (
                        <select
                          key={index}
                          value={age}
                          onChange={(e) => updateChildAge(index, parseInt(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        >
                          {Array.from({ length: 18 }, (_, i) => (
                            <option key={i} value={i}>{i} year{i !== 1 ? 's' : ''} old</option>
                          ))}
                        </select>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rooms */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Rooms</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateGuestCount('rooms', 'decrement')}
                      disabled={guestConfig.rooms <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{guestConfig.rooms}</span>
                    <button
                      onClick={() => updateGuestCount('rooms', 'increment')}
                      disabled={guestConfig.rooms >= 8}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-2"
          >
            {showFilters ? 'Hide' : 'Show'} Advanced Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
              <div className="flex gap-2">
                {['3', '4', '5'].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.ratings.includes(rating)}
                      onChange={(e) => handleFilterChange('ratings', rating, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500/20"
                    />
                    <span className="text-sm">{rating}+ Stars</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'WIFI', label: 'Free WiFi' },
                  { value: 'POOL', label: 'Swimming Pool' },
                  { value: 'SPA', label: 'Spa' },
                  { value: 'FITNESS_CENTER', label: 'Fitness Center' },
                  { value: 'RESTAURANT', label: 'Restaurant' },
                  { value: 'PARKING', label: 'Parking' }
                ].map((amenity) => (
                  <label key={amenity.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity.value)}
                      onChange={(e) => handleFilterChange('amenities', amenity.value, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500/20"
                    />
                    <span className="text-sm">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (per night)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '0-100', label: 'Under $100' },
                  { value: '100-200', label: '$100 - $200' },
                  { value: '200-300', label: '$200 - $300' },
                  { value: '300+', label: '$300+' }
                ].map((range) => (
                  <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      value={range.value}
                      checked={filters.priceRange === range.value}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value, true)}
                      className="border-gray-300 text-orange-600 focus:ring-orange-500/20"
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading || !searchParams.cityCode || !searchParams.checkInDate || !searchParams.checkOutDate}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Search Hotels</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HotelSearch;