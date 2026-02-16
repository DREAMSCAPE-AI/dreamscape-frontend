import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, Heart, Share2, Clock, Glasses } from 'lucide-react';
import voyageService from '@/services/voyage/VoyageService';
import imageService from '@/services/utility/imageService';
import QRCodeDisplay from '../../components/vr/QRCodeDisplay';

interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
  price: {
    from: number;
    currency: string;
  };
  images: string[];
  highlights: string[];
  bestTimeToVisit: string;
  duration: string;
  activities: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    rating: number;
    image: string;
  }>;
}

export default function DestinationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestination = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        let locationResult = null;
        
        // First try to search by the ID as-is (could be an airport code)
        try {
          locationResult = await voyageService.searchLocations({
            keyword: id,
            subType: 'CITY'
          });
        } catch (firstError) {
          console.warn('First search attempt failed:', firstError);
        }
        
        // If no results, try treating it as a formatted city name
        if (!locationResult?.data || locationResult.data.length === 0) {
          try {
            const formattedName = id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            locationResult = await voyageService.searchLocations({
              keyword: formattedName,
              subType: 'CITY'
            });
          } catch (secondError) {
            console.warn('Second search attempt failed:', secondError);
          }
        }
        
        // If still no results, try some common airport code mappings
        if (!locationResult?.data || locationResult.data.length === 0) {
          const airportCodeMappings: { [key: string]: string } = {
            'PAR': 'Paris',
            'NRT': 'Tokyo',
            'DXB': 'Dubai',
            'JFK': 'New York',
            'LHR': 'London',
            'BKK': 'Bangkok',
            'CDG': 'Paris',
            'LAX': 'Los Angeles',
            'SIN': 'Singapore',
            'HKG': 'Hong Kong'
          };
          
          const cityName = airportCodeMappings[id.toUpperCase()];
          if (cityName) {
            try {
              locationResult = await voyageService.searchLocations({
                keyword: cityName,
                subType: 'CITY'
              });
            } catch (thirdError) {
              console.warn('Third search attempt failed:', thirdError);
            }
          }
        }

        if (locationResult?.data && locationResult.data.length > 0) {
          const location = locationResult.data[0];
          
          // Get dynamic images for this destination
          const destinationImages = await Promise.all([
            imageService.getDestinationImage(location.name || id),
            imageService.getDestinationImage(`${location.name || id} architecture`),
            imageService.getDestinationImage(`${location.name || id} culture`),
            imageService.getDestinationImage(`${location.name || id} landscape`)
          ]);
          
          // Try to get activities for this location if coordinates are available
          let activities = [];
          if (location.geoCode) {
            try {
              const activitiesResult = await voyageService.searchActivities({
                latitude: location.geoCode.latitude,
                longitude: location.geoCode.longitude,
                radius: 20
              });
              
              activities = activitiesResult.data?.slice(0, 6).map((activity: any, index: number) => ({
                id: activity.id || `activity-${index}`,
                name: activity.name || 'Local Experience',
                description: activity.shortDescription || activity.description || 'Discover local attractions and experiences',
                price: activity.price?.amount ? parseFloat(activity.price.amount) : Math.floor(Math.random() * 100) + 50,
                duration: activity.duration || '2-3 hours',
                rating: activity.rating || 4.0 + Math.random(),
                image: activity.pictures?.[0]?.url || `https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&q=80`
              })) || [];
            } catch (activityError) {
              console.warn('Could not fetch activities:', activityError);
            }
          }

          const transformedDestination: Destination = {
            id: id,
            name: location.name || id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            location: `${location.address?.cityName || location.name}, ${location.address?.countryName || 'Unknown'}`,
            description: location.description || `Discover the beauty and culture of ${location.name}. Experience local attractions, cuisine, and unforgettable moments in this amazing destination.`,
            rating: 4.0 + Math.random() * 0.8,
            reviewCount: Math.floor(Math.random() * 2000) + 500,
            price: {
              from: Math.floor(Math.random() * 300) + 200,
              currency: '€'
            },
            images: destinationImages,
            highlights: [
              'Historic landmarks and architecture',
              'World-class museums and galleries',
              'Vibrant local culture and cuisine',
              'Beautiful parks and gardens'
            ],
            bestTimeToVisit: 'April to October',
            duration: '3-5 days recommended',
            activities
          };

          setDestination(transformedDestination);
        } else {
          // Create a fallback destination if API fails completely
          const fallbackName = id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
          const fallbackImages = await Promise.all([
            imageService.getDestinationImage(fallbackName),
            imageService.getDestinationImage(`${fallbackName} architecture`),
            imageService.getDestinationImage(`${fallbackName} culture`),
            imageService.getDestinationImage(`${fallbackName} landscape`)
          ]);
          
          const fallbackDestination: Destination = {
            id: id,
            name: fallbackName,
            location: `${fallbackName}, Worldwide`,
            description: `Discover the beauty and culture of ${fallbackName}. Experience local attractions, cuisine, and unforgettable moments in this amazing destination.`,
            rating: 4.2,
            reviewCount: 1250,
            price: {
              from: 299,
              currency: '€'
            },
            images: fallbackImages,
            highlights: [
              'Historic landmarks and architecture',
              'World-class museums and galleries',
              'Vibrant local culture and cuisine',
              'Beautiful parks and gardens'
            ],
            bestTimeToVisit: 'April to October',
            duration: '3-5 days recommended',
            activities: []
          };
          
          setDestination(fallbackDestination);
          console.warn(`Using fallback data for destination: ${id}`);
        }
      } catch (error) {
        console.error('Failed to fetch destination:', error);
        
        // Create a fallback destination even if there's an error
        const fallbackName = id?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Destination';
        const fallbackImages = await Promise.all([
          imageService.getDestinationImage(fallbackName),
          imageService.getDestinationImage(`${fallbackName} architecture`),
          imageService.getDestinationImage(`${fallbackName} culture`),
          imageService.getDestinationImage(`${fallbackName} landscape`)
        ]);
        
        const fallbackDestination: Destination = {
          id: id || 'unknown',
          name: fallbackName,
          location: `${fallbackName}, Worldwide`,
          description: `Discover the beauty and culture of ${fallbackName}. Experience local attractions, cuisine, and unforgettable moments in this amazing destination.`,
          rating: 4.2,
          reviewCount: 1250,
          price: {
            from: 299,
            currency: '€'
          },
          images: fallbackImages,
          highlights: [
            'Historic landmarks and architecture',
            'World-class museums and galleries',
            'Vibrant local culture and cuisine',
            'Beautiful parks and gardens'
          ],
          bestTimeToVisit: 'April to October',
          duration: '3-5 days recommended',
          activities: []
        };
        
        setDestination(fallbackDestination);
        setError('Some destination details may be limited due to connectivity issues');
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Destination</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Destination Not Found</h1>
          <p className="text-gray-600 mt-2">The destination you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={destination.images[0]}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
          <div className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            {destination.location}
          </div>
        </div>
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <div className="ml-2">
            <QRCodeDisplay
              destinationId={id || 'unknown'}
              expirationMinutes={10}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{destination.rating.toFixed(1)}</span>
                    <span className="text-gray-600">({destination.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {destination.price.currency}{destination.price.from}
                  </div>
                  <div className="text-sm text-gray-600">per person</div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">{destination.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Highlights</h3>
                  <ul className="space-y-1">
                    {destination.highlights.map((highlight, index) => (
                      <li key={index} className="text-gray-600 text-sm">• {highlight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Travel Info</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Best time: {destination.bestTimeToVisit}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration: {destination.duration}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities */}
            {destination.activities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Popular Activities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4">
                      <img
                        src={activity.image}
                        alt={activity.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold mb-1">{activity.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{activity.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">€{activity.price}</div>
                          <div className="text-xs text-gray-600">{activity.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold mb-4">Book Your Trip</h3>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mb-3">
                Book Now
              </button>
              <button className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}