import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DestinationCard from '@/components/DestinationCard';
import voyageService from '@/services/api/VoyageService';
import imageService from '@/services/imageService';

interface Destination {
  id: string;
  title: string;
  image: string;
  description: string;
}

export default function DestinationsPage() {
  const { t } = useTranslation('destinations');
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we have cached destinations
        const cachedDestinations = localStorage.getItem('cachedDestinations');
        const cacheTimestamp = localStorage.getItem('destinationsCacheTime');
        const cacheExpiry = 30 * 60 * 1000; // Increased to 30 minutes to reduce API calls
        
        if (cachedDestinations && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
          if (!isExpired) {
            console.log('Using cached destinations');
            setDestinations(JSON.parse(cachedDestinations));
            setLoading(false);
            return;
          }
        }
        
        // Fetch popular destinations using flight destinations API
        const popularCities = ['PAR', 'NRT', 'DXB', 'JFK', 'LHR', 'BKK'];
        const destinations: Destination[] = [];
        let rateLimitHit = false;
        
        console.log('Fetching destinations with rate limiting...');
        
        // Sequential API calls with increased delay to avoid rate limiting
        for (let i = 0; i < popularCities.length && !rateLimitHit; i++) {
          const cityCode = popularCities[i];
          try {
            // Add delay between requests (except for the first one)
            if (i > 0) {
              console.log(`Waiting 2 seconds before next request (${i + 1}/${popularCities.length})...`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Increased to 2 seconds
            }
            
            console.log(`Fetching destination ${i + 1}/${popularCities.length}: ${cityCode}`);
            
            const response = await voyageService.searchLocations({
              keyword: cityCode,
              subType: 'CITY'
            });
            
            if (response.data && response.data.length > 0) {
              const location = response.data[0];
              const locationName = location.name || getDefaultCityName(cityCode);
              
              // Fetch image dynamically with error handling
              let imageUrl: string;
              try {
                imageUrl = await imageService.getDestinationImage(locationName);
              } catch (imageError) {
                console.warn(`Failed to fetch image for ${locationName}, using fallback`);
                imageUrl = getDefaultImage(cityCode);
              }
              
              destinations.push({
                id: location.iataCode || cityCode,
                title: locationName,
                image: imageUrl,
                description: t('list.exploreWonders', { city: locationName })
              });
              
              console.log(`Successfully fetched destination: ${locationName}`);
            } else {
              console.warn(`No location data found for ${cityCode}, using fallback`);
              // Add fallback destination
              const fallbackDestination = createFallbackDestination(cityCode);
              destinations.push(fallbackDestination);
            }
          } catch (err: any) {
            console.error(`Failed to fetch destination ${cityCode}:`, err);
            
            // Check for rate limiting
            if (err.response?.status === 429 || err.message?.includes('Rate limit')) {
              console.warn('Rate limit hit, stopping further API calls');
              rateLimitHit = true;
              break;
            }
            
            // Check for other API errors
            if (err.response?.status === 400 && err.message?.includes('INVALID FORMAT')) {
              console.warn(`Invalid format error for ${cityCode}, using fallback`);
              const fallbackDestination = createFallbackDestination(cityCode);
              destinations.push(fallbackDestination);
            } else {
              // For other errors, add fallback and continue
              console.warn(`API error for ${cityCode}, using fallback:`, err.message);
              const fallbackDestination = createFallbackDestination(cityCode);
              destinations.push(fallbackDestination);
            }
          }
        }
        
        // If we have some destinations, use them; otherwise use all fallback data
        if (destinations.length > 0) {
          // Fill remaining slots with fallback data if we hit rate limit early
          if (rateLimitHit && destinations.length < popularCities.length) {
            const remainingCities = popularCities.slice(destinations.length);
            for (const cityCode of remainingCities) {
              destinations.push(createFallbackDestination(cityCode));
            }
          }
          
          // Cache the successful results
          localStorage.setItem('cachedDestinations', JSON.stringify(destinations));
          localStorage.setItem('destinationsCacheTime', Date.now().toString());
          setDestinations(destinations);
        } else {
          console.log('No destinations fetched, using all fallback data');
          const fallbackDestinations = await getDefaultDestinations();
          setDestinations(fallbackDestinations);
        }
        
      } catch (err: any) {
        console.error('Error fetching destinations:', err);
        setError(t('list.errorLoading'));
        
        // Always provide fallback data
        const defaultDestinations = await getDefaultDestinations();
        setDestinations(defaultDestinations);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  // Create fallback destination with realistic data
  const createFallbackDestination = (cityCode: string): Destination => {
    const cityData = getCityData(cityCode);
    return {
      id: cityCode,
      title: cityData.name,
      image: cityData.image,
      description: cityData.description
    };
  };

  // Get city data for fallback
  const getCityData = (cityCode: string) => {
    const cityMap: Record<string, { name: string; image: string; description: string }> = {
      PAR: {
        name: 'Paris',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
        description: t('cities.paris.description')
      },
      NRT: {
        name: 'Tokyo',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
        description: t('cities.tokyo.description')
      },
      DXB: {
        name: 'Dubai',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
        description: t('cities.dubai.description')
      },
      JFK: {
        name: 'New York',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
        description: t('cities.newYork.description')
      },
      LHR: {
        name: 'London',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
        description: t('cities.london.description')
      },
      BKK: {
        name: 'Bangkok',
        image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop',
        description: t('cities.bangkok.description')
      }
    };

    return cityMap[cityCode] || {
      name: getDefaultCityName(cityCode),
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      description: t('cities.default.description')
    };
  };

  // Get default city name from airport code
  const getDefaultCityName = (cityCode: string): string => {
    const cityNames: Record<string, string> = {
      PAR: 'Paris',
      NRT: 'Tokyo', 
      DXB: 'Dubai',
      JFK: 'New York',
      LHR: 'London',
      BKK: 'Bangkok'
    };
    return cityNames[cityCode] || cityCode;
  };

  // Get default image for city code
  const getDefaultImage = (cityCode: string): string => {
    const images: Record<string, string> = {
      PAR: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
      NRT: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
      DXB: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
      JFK: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
      LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
      BKK: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop'
    };
    return images[cityCode] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop';
  };

  // Get default destinations as fallback
  const getDefaultDestinations = async (): Promise<Destination[]> => {
    const popularCities = ['PAR', 'NRT', 'DXB', 'JFK', 'LHR', 'BKK'];
    return popularCities.map(cityCode => createFallbackDestination(cityCode));
  };

  const handleDestinationClick = (destination: Destination) => {
    navigate(`/destination/${destination.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">{t('list.title')}</h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600">{t('list.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-40 md:h-48 bg-gray-300"></div>
                <div className="p-4 md:p-6">
                  <div className="h-5 md:h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">{t('list.title')}</h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">{t('list.subtitle')}</p>
          {error && (
            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm md:text-base text-yellow-800">{error}</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              id={destination.id}
              title={destination.title}
              image={destination.image}
              description={destination.description}
              onClick={() => handleDestinationClick(destination)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}