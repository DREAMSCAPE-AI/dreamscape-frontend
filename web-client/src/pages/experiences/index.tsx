import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Users } from 'lucide-react';
import voyageService from '@/services/api/VoyageService';
import imageService from '@/services/imageService';

interface Experience {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  duration: string;
  groupSize: string;
  price: string;
  image: string;
  category: string;
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Experiences' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'culture', name: 'Culture' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'nature', name: 'Nature' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'entertainment', name: 'Entertainment' }
  ];

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have cached experiences
      const cachedExperiences = localStorage.getItem('cachedExperiences');
      const cacheTimestamp = localStorage.getItem('experiencesCacheTime');
      const cacheExpiry = 15 * 60 * 1000; // 15 minutes
      
      if (cachedExperiences && cacheTimestamp) {
        const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
        if (!isExpired) {
          setExperiences(JSON.parse(cachedExperiences));
          setLoading(false);
          return;
        }
      }

      // Fetch experiences from popular destinations
      const popularDestinations = ['PAR', 'NRT', 'DXB', 'JFK', 'LHR', 'BKK'];
      const allExperiences: Experience[] = [];

      // Sequential API calls with delay to avoid rate limiting
      for (let i = 0; i < popularDestinations.length; i++) {
        const cityCode = popularDestinations[i];
        try {
          // Add delay between requests (except for the first one)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
          }

          const response = await voyageService.searchActivities({
            latitude: getCoordinates(cityCode).lat,
            longitude: getCoordinates(cityCode).lng,
            radius: 50
          });

          if (response.data && response.data.length > 0) {
            const cityName = getCityName(cityCode);
            const experiences = await Promise.all(
              response.data.slice(0, 3).map(async (activity: any, index: number) => {
                const activityName = activity.name || 'Amazing Experience';
                const category = getRandomCategory();
                
                return {
                  id: `${cityCode}-${index}`,
                  name: activityName,
                  description: activity.shortDescription || 'Discover something unique and memorable',
                  location: cityName,
                  rating: activity.rating || (4.0 + Math.random()),
                  duration: activity.duration || `${Math.floor(Math.random() * 6) + 2} hours`,
                  groupSize: `Up to ${Math.floor(Math.random() * 15) + 5} people`,
                  price: `$${Math.floor(Math.random() * 200) + 50}`,
                  image: await imageService.getActivityImage(activityName, category, cityName),
                  category: category
                };
              })
            );
            allExperiences.push(...experiences);
          }
        } catch (err: any) {
          console.warn(`Failed to fetch experiences for ${cityCode}:`, err);
          
          // If we hit rate limit, stop making more requests and use fallback
          if (err.response?.status === 429) {
            console.warn('Rate limit hit, using fallback data');
            break;
          }
        }
      }

      if (allExperiences.length === 0) {
        const defaultExperiences = await getDefaultExperiences();
        setExperiences(defaultExperiences);
      } else {
        // Cache the successful results
        localStorage.setItem('cachedExperiences', JSON.stringify(allExperiences));
        localStorage.setItem('experiencesCacheTime', Date.now().toString());
        setExperiences(allExperiences);
      }
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError('Failed to load experiences');
      const defaultExperiences = await getDefaultExperiences();
      setExperiences(defaultExperiences);
    } finally {
      setLoading(false);
    }
  };

  const getCoordinates = (cityCode: string) => {
    const coords: { [key: string]: { lat: number; lng: number } } = {
      'PAR': { lat: 48.8566, lng: 2.3522 },
      'NRT': { lat: 35.6762, lng: 139.6503 },
      'DXB': { lat: 25.2048, lng: 55.2708 },
      'JFK': { lat: 40.7128, lng: -74.0060 },
      'LHR': { lat: 51.5074, lng: -0.1278 },
      'BKK': { lat: 13.7563, lng: 100.5018 }
    };
    return coords[cityCode] || { lat: 0, lng: 0 };
  };

  const getCityName = (cityCode: string) => {
    const names: { [key: string]: string } = {
      'PAR': 'Paris',
      'NRT': 'Tokyo',
      'DXB': 'Dubai',
      'JFK': 'New York',
      'LHR': 'London',
      'BKK': 'Bangkok'
    };
    return names[cityCode] || 'Unknown';
  };

  const getRandomCategory = () => {
    const cats = ['adventure', 'culture', 'food', 'nature', 'wellness', 'entertainment'];
    return cats[Math.floor(Math.random() * cats.length)];
  };

  const getDefaultExperiences = async (): Promise<Experience[]> => {
    const defaultActivities = [
      {
        name: 'Eiffel Tower Skip-the-Line Tour',
        description: 'Experience the iconic Eiffel Tower with priority access and expert guide',
        location: 'Paris',
        rating: 4.8,
        duration: '3 hours',
        groupSize: 'Up to 12 people',
        price: '$89',
        category: 'culture'
      },
      {
        name: 'Tokyo Food Walking Tour',
        description: 'Discover authentic Japanese cuisine in hidden local spots',
        location: 'Tokyo',
        rating: 4.9,
        duration: '4 hours',
        groupSize: 'Up to 8 people',
        price: '$125',
        category: 'food'
      },
      {
        name: 'Dubai Desert Safari',
        description: 'Thrilling desert adventure with dune bashing and camel riding',
        location: 'Dubai',
        rating: 4.7,
        duration: '6 hours',
        groupSize: 'Up to 20 people',
        price: '$95',
        category: 'adventure'
      },
      {
        name: 'Central Park Bike Tour',
        description: 'Explore New York\'s most famous park on two wheels',
        location: 'New York',
        rating: 4.6,
        duration: '2 hours',
        groupSize: 'Up to 15 people',
        price: '$45',
        category: 'nature'
      },
      {
        name: 'Thames River Cruise',
        description: 'See London\'s landmarks from the water with commentary',
        location: 'London',
        rating: 4.5,
        duration: '1.5 hours',
        groupSize: 'Up to 50 people',
        price: '$35',
        category: 'culture'
      },
      {
        name: 'Thai Cooking Class',
        description: 'Learn to cook authentic Thai dishes with local ingredients',
        location: 'Bangkok',
        rating: 4.8,
        duration: '4 hours',
        groupSize: 'Up to 10 people',
        price: '$75',
        category: 'food'
      }
    ];

    const experiences = await Promise.all(
      defaultActivities.map(async (activity, index) => ({
        id: `exp-${index + 1}`,
        name: activity.name,
        description: activity.description,
        location: activity.location,
        rating: activity.rating,
        duration: activity.duration,
        groupSize: activity.groupSize,
        price: activity.price,
        image: await imageService.getActivityImage(activity.name, activity.category, activity.location),
        category: activity.category
      }))
    );

    return experiences;
  };

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Unique Experiences</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Unique Experiences</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover unforgettable activities and experiences around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchExperiences}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((experience) => (
            <div key={experience.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={experience.image}
                alt={experience.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-orange-600 font-medium capitalize">
                    {experience.category}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {experience.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{experience.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{experience.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {experience.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {experience.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {experience.groupSize}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-orange-600">
                    {experience.price}
                  </span>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExperiences.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No experiences found matching your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}
