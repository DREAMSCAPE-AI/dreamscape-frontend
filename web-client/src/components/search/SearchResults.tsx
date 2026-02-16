import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headset as VrHeadset, Star, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import voyageService from '@/services/voyage/VoyageService';

interface SearchResult {
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  availability: string;
  type: string;
  features: string[];
}

interface SearchResultsProps {
  onVRPreview: (id: string) => void;
  searchQuery?: string;
  searchFilters?: any;
}

const SearchResults: React.FC<SearchResultsProps> = ({ onVRPreview, searchQuery, searchFilters }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery || searchFilters) {
      performSearch();
    } else {
      // Load default popular results
      setResults(getDefaultResults());
    }
  }, [searchQuery, searchFilters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // If we have location-based search, use activities API
      if (searchQuery) {
        // First, try to get location coordinates
        const locationResponse = await voyageService.searchLocations({
          keyword: searchQuery,
          subType: 'CITY'
        });

        if (locationResponse.data && locationResponse.data.length > 0) {
          const location = locationResponse.data[0];
          
          // Search for activities in this location
          const activitiesResponse = await voyageService.searchActivities({
            latitude: location.geoCode?.latitude || 0,
            longitude: location.geoCode?.longitude || 0,
            radius: 50
          });

          if (activitiesResponse.data && activitiesResponse.data.length > 0) {
            const searchResults = activitiesResponse.data.map((activity: any, index: number) => ({
              id: activity.id || `activity-${index}`,
              title: activity.name || 'Experience',
              location: `${location.name}, ${location.address?.countryName || ''}`,
              image: getActivityImage(activity.name || activity.type),
              rating: Math.random() * 2 + 3.5, // Mock rating for now
              reviews: Math.floor(Math.random() * 200) + 20,
              price: activity.price?.amount ? `${activity.price.currencyCode} ${activity.price.amount}` : 'From €50',
              availability: 'Available',
              type: activity.type || 'Activity',
              features: getActivityFeatures(activity)
            }));

            setResults(searchResults.slice(0, 10)); // Limit to 10 results
          } else {
            setResults(getDefaultResults());
          }
        } else {
          setResults(getDefaultResults());
        }
      } else {
        setResults(getDefaultResults());
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results');
      setResults(getDefaultResults());
    } finally {
      setLoading(false);
    }
  };

  const getActivityImage = (activityName: string): string => {
    const imageMap: { [key: string]: string } = {
      'museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80',
      'tour': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6d?auto=format&fit=crop&q=80',
      'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80',
      'park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80',
      'shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80',
      'entertainment': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80'
    };

    const matchedKey = Object.keys(imageMap).find(key => 
      activityName.toLowerCase().includes(key)
    );

    return matchedKey ? imageMap[matchedKey] : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80';
  };

  const getActivityFeatures = (activity: any): string[] => {
    const features = [];
    if (activity.rating) features.push(`${activity.rating}★ Rated`);
    if (activity.bookingLink) features.push('Bookable');
    if (activity.pictures && activity.pictures.length > 0) features.push('Photo Gallery');
    return features.length > 0 ? features : ['Popular', 'Recommended'];
  };

  const getDefaultResults = (): SearchResult[] => [
    {
      id: 'paris-1',
      title: 'Romantic Paris Getaway',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 128,
      price: '€299',
      availability: 'Available from June 15',
      type: 'Cultural',
      features: ['City View', 'Near Metro', 'Historic District']
    },
    {
      id: 'tokyo-1',
      title: 'Modern Tokyo Experience',
      location: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80',
      rating: 4.8,
      reviews: 95,
      price: '¥35,000',
      availability: 'Available from July 1',
      type: 'Urban',
      features: ['City Center', 'Modern Design', 'Shopping District']
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-80 h-48 bg-gray-300"></div>
              <div className="flex-1 p-6">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => performSearch()} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-80 relative group">
              <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onVRPreview(result.id)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <VrHeadset className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{result.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                      <span>{result.rating} ({result.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{result.price}</div>
                  <span className="text-sm text-gray-500">per night</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {result.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{result.availability}</span>
                </div>
                <button 
                  onClick={() => navigate(`/destination/${result.id}`)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SearchResults;