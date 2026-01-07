import React, { useState } from 'react';
import ActivitySearch, { ActivitySearchParams } from './ActivitySearch';
import ActivityResults, { Activity } from './ActivityResults';
import ActivityDetails from './ActivityDetails';
import voyageService from '@/services/api/VoyageService';
import imageService from '@/services/imageService';

type BookingStep = 'search' | 'results' | 'details' | 'payment';

const ActivityBookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Amadeus Test API supported cities
  const testApiSupportedCities = [
    'Paris', 'London', 'Barcelona', 'Berlin',
    'New York', 'San Francisco', 'Dallas', 'Bangalore'
  ];

  const handleSearch = async (params: ActivitySearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const DEBUG_MODE = false; // Désactivé après analyse

      if (DEBUG_MODE) {
        console.log('🚀 Activity search initiated');
        console.log('📍 Location:', params.location);
        console.log('🏷️ Category:', params.category);
        console.log('⏱️ Duration:', params.duration);
        console.log('💰 Price range:', params.priceRange);
      }

      let fetchedActivities: Activity[] = [];

      // If "All Locations" is selected, fetch from all 8 supported test cities
      if (!params.location || params.location === '') {
        console.log('🌍 Searching in ALL supported test cities');

        // Fetch activities from all 8 supported cities in parallel
        const citySearchPromises = testApiSupportedCities.map(async (city) => {
          try {
            const searchParams = {
              latitude: getLocationCoordinates(city).latitude,
              longitude: getLocationCoordinates(city).longitude,
              radius: 20,
              locationName: city
            };

            const response = await voyageService.searchActivities(searchParams);
            return response.data || [];
          } catch (error) {
            console.error(`Failed to fetch activities for ${city}:`, error);
            return [];
          }
        });

        // Wait for all city searches to complete
        const allCityResults = await Promise.all(citySearchPromises);

        // Flatten all results into one array
        fetchedActivities = allCityResults.flat();

        console.log(`✅ Found ${fetchedActivities.length} total activities across all cities`);
      } else {
        // Single city search
        try {
          const searchParams = {
            latitude: getLocationCoordinates(params.location).latitude,
            longitude: getLocationCoordinates(params.location).longitude,
            radius: 20,
            locationName: params.location
          };

          if (DEBUG_MODE) {
            console.log('🔍 Searching activities with params:', searchParams);
          }

          const response = await voyageService.searchActivities(searchParams);

          if (DEBUG_MODE) {
            console.log('📡 API Response:', response);
            console.log('📊 Response data length:', response?.data?.length);
          }

          if (response && response.data && response.data.length > 0) {
            fetchedActivities = response.data.map((activity: any) => {
              // Clean description text - remove HTML tags
              const cleanDescription = (text: string) => {
                if (!text) return '';
                return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              };

              const description = cleanDescription(activity.description || '');
              const shortDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;

              // Extract location name properly
              let locationName = 'Unknown Location';
              const apiLocationName = activity.location?.name || '';
              const isCoordinates = /^[\d\.\,\s\-]+$/.test(apiLocationName);

              if (isCoordinates && params.location) {
                locationName = params.location;
              } else if (!isCoordinates && apiLocationName) {
                locationName = apiLocationName;
              } else if (params.location) {
                locationName = params.location;
              }

              const mappedActivity = {
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

              // Debug: Log category info for the first few activities
              if (DEBUG_MODE && fetchedActivities.length < 5) {
                console.log(`📋 Activity "${activity.name}":`, {
                  originalCategory: activity.category,
                  originalType: activity.type,
                  mappedCategory: mappedActivity.category,
                  duration: mappedActivity.duration
                });
              }

              return mappedActivity;
            });
          }
        } catch (apiError) {
          console.error('❌ Amadeus API failed:', apiError);
        }
      }

      // If no activities found, use fallback
      if (fetchedActivities.length === 0) {
        if (DEBUG_MODE) console.log('🔄 Using fallback activities');
        fetchedActivities = await generateFallbackActivities(params.location || 'Paris', params.category);
      }

      // Fetch images for activities without images
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

      // Apply category filter
      const categoryFilteredActivities = params.category === 'all'
        ? fetchedActivities
        : fetchedActivities.filter(activity => activity.category === params.category);

      if (DEBUG_MODE) {
        console.log(`🔍 After category filter (${params.category}): ${categoryFilteredActivities.length} activities`);
        // Show category distribution
        const categoryCount: { [key: string]: number } = {};
        fetchedActivities.forEach(activity => {
          categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
        });
        console.log('📊 Category distribution:', categoryCount);
      }

      // Apply price range filter
      const priceFilteredActivities = categoryFilteredActivities.filter(activity =>
        activity.price.amount >= params.priceRange.min && activity.price.amount <= params.priceRange.max
      );

      if (DEBUG_MODE) {
        console.log(`💰 After price filter ($${params.priceRange.min}-$${params.priceRange.max}): ${priceFilteredActivities.length} activities`);
      }

      // Apply duration filter
      const parseDuration = (durationStr: string): number => {
        // Parse duration strings like "2-3 hours", "1.5 hours", "4 hours", etc.
        const match = durationStr.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
      };

      let durationFilteredActivities = priceFilteredActivities;
      if (params.duration !== 'all') {
        durationFilteredActivities = priceFilteredActivities.filter(activity => {
          const hours = parseDuration(activity.duration);

          switch (params.duration) {
            case 'short':
              return hours < 2;
            case 'medium':
              return hours >= 2 && hours <= 4;
            case 'long':
              return hours > 4 && hours <= 8;
            case 'full-day':
              return hours > 8;
            default:
              return true;
          }
        });
      }

      if (DEBUG_MODE) {
        console.log(`⏱️ After duration filter (${params.duration}): ${durationFilteredActivities.length} activities`);
      }

      setActivities(durationFilteredActivities);
      setCurrentStep('results');

    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again later.');

      const fallbackActivities = await generateFallbackActivities(params.location || 'Paris', params.category);
      setActivities(fallbackActivities);
      setCurrentStep('results');
    } finally {
      setLoading(false);
    }
  };

  const getLocationCoordinates = (location: string) => {
    const coordinates: { [key: string]: { latitude: number; longitude: number } } = {
      'Paris': { latitude: 48.91, longitude: 2.25 },
      'London': { latitude: 51.520180, longitude: -0.169882 },
      'Barcelona': { latitude: 41.42, longitude: 2.11 },
      'Berlin': { latitude: 52.541755, longitude: 13.354201 },
      'New York': { latitude: 40.792027, longitude: -74.058204 },
      'San Francisco': { latitude: 37.810980, longitude: -122.483716 },
      'Dallas': { latitude: 32.806993, longitude: -96.836857 },
      'Bangalore': { latitude: 13.023577, longitude: 77.536856 },
      'Tokyo': { latitude: 35.6762, longitude: 139.6503 },
      'Dubai': { latitude: 25.2048, longitude: 55.2708 },
      'Bangkok': { latitude: 13.7563, longitude: 100.5018 },
      'Rome': { latitude: 41.9028, longitude: 12.4964 },
      'Amsterdam': { latitude: 52.3676, longitude: 4.9041 },
      'Singapore': { latitude: 1.3521, longitude: 103.8198 }
    };
    return coordinates[location] || coordinates['Paris'];
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

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentStep('details');
    // TODO: Navigate to activity details page
    console.log('Selected activity:', activity);
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {[
                { step: 'search', label: 'Search' },
                { step: 'results', label: 'Select Activity' },
                { step: 'details', label: 'Details' },
                { step: 'payment', label: 'Payment' }
              ].map(({ step, label }, index) => (
                <div
                  key={step}
                  className="flex items-center"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep === step
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-2 text-sm font-medium text-gray-600">
                    {label}
                  </div>
                  {index < 3 && (
                    <div className="w-24 h-0.5 mx-2 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="max-w-4xl mx-auto">
            {currentStep === 'search' && (
              <ActivitySearch
                onSearch={handleSearch}
                loading={loading}
                error={error}
              />
            )}

            {currentStep === 'results' && (
              <div className="space-y-6">
                <ActivitySearch
                  onSearch={handleSearch}
                  loading={loading}
                  error={error}
                />
                <ActivityResults
                  activities={activities}
                  loading={loading}
                  onSelect={handleActivitySelect}
                />
              </div>
            )}

            {currentStep === 'details' && selectedActivity && (
              <ActivityDetails
                activity={selectedActivity}
                onClose={() => setCurrentStep('results')}
                onBack={() => setCurrentStep('results')}
                onAccept={() => setCurrentStep('payment')}
              />
            )}

            {currentStep === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold">Payment</h2>
                <p className="text-gray-600 mt-2">Payment implementation coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityBookingFlow;
