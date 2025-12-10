import { useState } from 'react';
import { Search, MapPin, Star, Clock, Users, Filter, Calendar, DollarSign } from 'lucide-react';
import voyageService from '@/services/api/VoyageService';
import imageService from '@/services/imageService';

interface Activity {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  location: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviewCount: number;
  duration: string;
  groupSize: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  images: string[];
  category: string;
  tags: string[];
  availability: {
    available: boolean;
    nextAvailable?: string;
  };
  bookingInfo: {
    instantConfirmation: boolean;
    freeCancellation: boolean;
    cancellationPolicy: string;
  };
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Paris'); // Default to Paris
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

  const popularLocations = [
    'Paris', 'London', 'New York', 'Tokyo', 'Dubai', 'Bangkok',
    'Rome', 'Barcelona', 'Amsterdam', 'Singapore'
  ];

  // Remove automatic fetching on mount - only fetch when user searches
  // useEffect(() => {
  //   fetchActivities();
  // }, [selectedLocation, selectedCategory]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Debug mode - set to true to see detailed logs
      const DEBUG_MODE = false;

      if (DEBUG_MODE) {
        console.log('🚀 fetchActivities called');
        console.log('📍 selectedLocation:', selectedLocation);
        console.log('🏷️ selectedCategory:', selectedCategory);
      }

      const cacheKey = `activities_${selectedLocation}_${selectedCategory}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_time`);
      const cacheExpiry = 30 * 60 * 1000;

      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < cacheExpiry) {
          if (DEBUG_MODE) console.log('✨ Using cached data');
          setActivities(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      let fetchedActivities: Activity[] = [];

      try {
        const searchParams = {
          latitude: getLocationCoordinates(selectedLocation).latitude,
          longitude: getLocationCoordinates(selectedLocation).longitude,
          radius: 20
        };

        if (DEBUG_MODE) {
          console.log('🔍 Searching activities with params:', searchParams);
          console.log('🌍 Selected location:', selectedLocation);
        }

        const response = await voyageService.searchActivities(searchParams);

        if (DEBUG_MODE) {
          console.log('📡 API Response:', response);
          console.log('📊 Response data length:', response?.data?.length);
        }

        // Debug log to see the API response structure
        if (response && response.data && response.data.length > 0) {
          if (DEBUG_MODE) {
            console.log('✅ First activity from API:', JSON.stringify(response.data[0], null, 2));
          }

          fetchedActivities = response.data.map((activity: any) => {
            // Clean description text - remove HTML tags
            const cleanDescription = (text: string) => {
              if (!text) return '';
              return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            };

            const description = cleanDescription(activity.description || '');
            const shortDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;

            // Extract location name properly
            // The API returns coordinates in location.name, so we need to use selectedLocation instead
            let locationName = 'Unknown Location';

            // Check if location.name contains coordinates (format: "48.8639, 2.3616")
            const apiLocationName = activity.location?.name || '';
            const isCoordinates = /^[\d\.\,\s\-]+$/.test(apiLocationName);

            if (isCoordinates && selectedLocation) {
              // Use the selected location from the dropdown
              locationName = selectedLocation;
            } else if (!isCoordinates && apiLocationName) {
              // Use the API location name if it's not coordinates
              locationName = apiLocationName;
            } else if (selectedLocation) {
              // Fallback to selected location
              locationName = selectedLocation;
            }

            return {
              id: activity.id,
              name: activity.name || 'Untitled Activity',
              description,
              shortDescription,
              location: {
                name: locationName,
                address: activity.location?.address || activity.meetingPoint || '',
                coordinates: activity.location?.coordinates || {
                  latitude: activity.location?.coordinates?.latitude || 0,
                  longitude: activity.location?.coordinates?.longitude || 0
                }
              },
              rating: activity.rating || 4.0 + Math.random() * 1.0,
              reviewCount: activity.reviewCount || Math.floor(Math.random() * 300) + 50,
              duration: activity.duration || '2-3 hours',
              groupSize: activity.groupSize || 'Up to 20 people',
              price: {
                amount: activity.price?.amount || 0,
                currency: activity.price?.currencyCode || 'USD',
                formatted: activity.price?.amount ? `$${activity.price.amount}` : 'Price on request'
              },
              images: activity.pictures || activity.images || [],
              category: activity.category || 'SIGHTSEEING',
              tags: activity.tags || ['Experience', 'Popular'],
              availability: {
                available: true,
                nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              },
              bookingInfo: {
                instantConfirmation: true,
                freeCancellation: true,
                cancellationPolicy: 'Free cancellation up to 24 hours before the activity'
              }
            };
          });
        } else {
          if (DEBUG_MODE) console.log('⚠️ No data in response or empty array');
        }
      } catch (apiError) {
        console.error('❌ Amadeus API failed:', apiError);
        if (DEBUG_MODE) console.error('Error details:', JSON.stringify(apiError, null, 2));
      }

      if (fetchedActivities.length === 0) {
        if (DEBUG_MODE) console.log('🔄 Using fallback activities');
        fetchedActivities = await generateFallbackActivities(selectedLocation, selectedCategory);
      }

      for (const activity of fetchedActivities) {
        if (activity.images.length === 0) {
          try {
            const image = await imageService.getActivityImage(
              activity.name,
              activity.category,
              activity.location.name
            );
            activity.images = [image];
          } catch (imageError) {
            console.warn('Failed to fetch image for activity:', activity.name);
            activity.images = [imageService.getFallbackImage('activity')];
          }
        }
      }

      setActivities(fetchedActivities);
      localStorage.setItem(cacheKey, JSON.stringify(fetchedActivities));
      localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again later.');

      const fallbackActivities = await generateFallbackActivities(selectedLocation, selectedCategory);
      setActivities(fallbackActivities);
    } finally {
      setLoading(false);
    }
  };

  const getLocationCoordinates = (location: string) => {
    const coordinates: { [key: string]: { latitude: number; longitude: number } } = {
      'Paris': { latitude: 48.8566, longitude: 2.3522 },
      'London': { latitude: 51.5074, longitude: -0.1278 },
      'New York': { latitude: 40.7128, longitude: -74.0060 },
      'Tokyo': { latitude: 35.6762, longitude: 139.6503 },
      'Dubai': { latitude: 25.2048, longitude: 55.2708 },
      'Bangkok': { latitude: 13.7563, longitude: 100.5018 },
      'Rome': { latitude: 41.9028, longitude: 12.4964 },
      'Barcelona': { latitude: 41.3851, longitude: 2.1734 },
      'Amsterdam': { latitude: 52.3676, longitude: 4.9041 },
      'Singapore': { latitude: 1.3521, longitude: 103.8198 }
    };
    return coordinates[location] || coordinates['Paris'];
  };

  const getDurationByCategory = (category: string): string => {
    const durations: { [key: string]: string } = {
      'SIGHTSEEING': '2-3 hours',
      'ATTRACTION': '1-2 hours',
      'TOUR': '3-4 hours',
      'MUSEUM': '1.5-2 hours',
      'ENTERTAINMENT': '2-3 hours',
      'ADVENTURE': '4-6 hours',
      'CULTURAL': '2-3 hours',
      'FOOD_AND_DRINK': '2-3 hours',
      'NATURE': '3-5 hours',
      'WELLNESS': '1-2 hours'
    };
    return durations[category] || '2-3 hours';
  };

  const getTagsByCategory = (category: string): string[] => {
    const tags: { [key: string]: string[] } = {
      'SIGHTSEEING': ['Guided Tour', 'Photography', 'Walking'],
      'ATTRACTION': ['Must-See', 'Popular', 'Family-Friendly'],
      'TOUR': ['Expert Guide', 'Small Group', 'Historical'],
      'MUSEUM': ['Art', 'History', 'Educational'],
      'ENTERTAINMENT': ['Fun', 'Evening', 'Live Show'],
      'ADVENTURE': ['Outdoor', 'Active', 'Thrilling'],
      'CULTURAL': ['Traditional', 'Local Experience', 'Authentic'],
      'FOOD_AND_DRINK': ['Tasting', 'Local Cuisine', 'Culinary'],
      'NATURE': ['Scenic', 'Wildlife', 'Outdoor'],
      'WELLNESS': ['Relaxing', 'Spa', 'Meditation']
    };
    return tags[category] || ['Experience', 'Popular'];
  };

  const generateFallbackActivities = async (location: string, category: string): Promise<Activity[]> => {
    const baseActivities = [
      {
        name: 'Historic City Walking Tour',
        description: 'Discover the rich history and hidden gems of the city with our expert local guide. Walk through ancient streets, visit iconic landmarks, and learn fascinating stories about the local culture and traditions.',
        category: 'TOUR',
        duration: '3 hours',
        basePrice: 45
      },
      {
        name: 'Art Museum Experience',
        description: 'Immerse yourself in world-class art collections featuring both classical masterpieces and contemporary works. Skip the lines with our priority access tickets.',
        category: 'MUSEUM',
        duration: '2 hours',
        basePrice: 25
      },
      {
        name: 'Food & Wine Tasting Tour',
        description: 'Savor the authentic flavors of local cuisine with visits to traditional markets, family-run restaurants, and local wine cellars.',
        category: 'FOOD_AND_DRINK',
        duration: '4 hours',
        basePrice: 85
      },
      {
        name: 'Adventure Park Experience',
        description: 'Get your adrenaline pumping with exciting outdoor activities including zip-lining, rock climbing, and obstacle courses suitable for all skill levels.',
        category: 'ADVENTURE',
        duration: '5 hours',
        basePrice: 120
      },
      {
        name: 'Cultural Heritage Site Visit',
        description: 'Explore UNESCO World Heritage sites and learn about ancient civilizations, architectural marvels, and cultural significance.',
        category: 'CULTURAL',
        duration: '3 hours',
        basePrice: 55
      },
      {
        name: 'Nature & Wildlife Safari',
        description: 'Experience the natural beauty and wildlife in their natural habitat. Perfect for nature lovers and photography enthusiasts.',
        category: 'NATURE',
        duration: '6 hours',
        basePrice: 150
      }
    ];

    const filteredActivities = category === 'all' 
      ? baseActivities 
      : baseActivities.filter(activity => activity.category === category);

    return filteredActivities.map((activity, index) => ({
      id: `fallback-${index}`,
      name: `${activity.name} - ${location}`,
      description: activity.description,
      shortDescription: activity.description.substring(0, 120) + '...',
      location: {
        name: location || 'Paris',
        address: `${location} City Center`,
        coordinates: getLocationCoordinates(location || 'Paris')
      },
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: Math.floor(Math.random() * 300) + 50,
      duration: activity.duration,
      groupSize: 'Up to 15 people',
      price: {
        amount: activity.basePrice,
        currency: 'USD',
        formatted: `$${activity.basePrice}`
      },
      images: [],
      category: activity.category,
      tags: getTagsByCategory(activity.category),
      availability: {
        available: true,
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      bookingInfo: {
        instantConfirmation: true,
        freeCancellation: true,
        cancellationPolicy: 'Free cancellation up to 24 hours before the activity'
      }
    }));
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.location.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = activity.price.amount >= priceRange.min && activity.price.amount <= priceRange.max;
    
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Activities
            </h1>
            <p className="text-xl mb-8 text-orange-100">
              Find and book unique experiences, tours, and attractions worldwide
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchActivities();
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">All Locations</option>
                    {popularLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={fetchActivities}
                  disabled={loading}
                  className="px-8 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Results Section */}
      {hasSearched && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Price:</span>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">Up to ${priceRange.max}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchActivities}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredActivities.length} Activities Found
              </h2>
              <div className="text-sm text-gray-600">
                {selectedLocation && `in ${selectedLocation}`}
                {selectedCategory !== 'all' && ` • ${categories.find(c => c.id === selectedCategory)?.name}`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Activity Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {activity.images.length > 0 ? (
                      <img
                        src={activity.images[0]}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = imageService.getFallbackImage('activity');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-white" />
                      </div>
                    )}
                    
                    {/* Availability Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.availability.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activity.availability.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {activity.name}
                      </h3>
                      <div className="text-right ml-2">
                        <div className="text-xl font-bold text-orange-600">
                          {activity.price.formatted}
                        </div>
                        <div className="text-xs text-gray-500">per person</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{typeof activity.rating === 'number' ? activity.rating.toFixed(1) : '4.5'}</span>
                        <span>({activity.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{activity.location.name}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {activity.shortDescription}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{activity.groupSize}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {activity.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Booking Features */}
                    <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
                      {activity.bookingInfo.instantConfirmation && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Instant confirmation
                        </span>
                      )}
                      {activity.bookingInfo.freeCancellation && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Free cancellation
                        </span>
                      )}
                    </div>

                    {/* Book Button */}
                    <button
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-medium"
                      onClick={() => {
                        // Navigate to activity detail page or booking flow
                        window.location.href = `/activities/${activity.id}`;
                      }}
                    >
                      View Details & Book
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or explore different locations.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLocation('');
                    setPriceRange({ min: 0, max: 1000 });
                  }}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
        </div>
      )}
    </div>
  );
}
