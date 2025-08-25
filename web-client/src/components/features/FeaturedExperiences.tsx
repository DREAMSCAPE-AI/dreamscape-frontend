import { useState, useEffect } from 'react';
import ExperienceCard from './ExperienceCard';
import SectionTitle from '../shared/SectionTitle';
import apiService from '@/services/api';
import imageService from '@/services/imageService';

interface FeaturedExperience {
  id: string;
  image: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  priceRange: string;
  rating: number;
}

const FeaturedExperiences = () => {
  const [experiences, setExperiences] = useState<FeaturedExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedExperiences = async () => {
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

        // Fetch activities from popular destinations
        const popularLocations = [
          { lat: 48.8566, lng: 2.3522, name: 'Paris, France' }, // Paris
          { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE' }, // Dubai
          { lat: 45.4408, lng: 12.3155, name: 'Venice, Italy' }, // Venice
          { lat: 46.8182, lng: 8.2275, name: 'Swiss Alps' } // Swiss Alps
        ];

        const experiences: FeaturedExperience[] = [];

        // Sequential API calls with delay to avoid rate limiting
        for (let i = 0; i < popularLocations.length; i++) {
          const location = popularLocations[i];
          try {
            // Add delay between requests (except for the first one)
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
            }

            const response = await apiService.searchActivities({
              latitude: location.lat,
              longitude: location.lng,
              radius: 50
            });

            if (response.data && response.data.length > 0) {
              const activity = response.data[0]; // Take the first activity
              const activityName = activity.name || `Experience in ${location.name.split(',')[0]}`;
              
              experiences.push({
                id: activity.id || `${location.name}-${Date.now()}`,
                image: await imageService.getActivityImage(activityName, activity.type, location.name),
                title: activityName,
                location: location.name,
                type: activity.type || 'Cultural Tour',
                duration: activity.duration || '3 hours',
                priceRange: activity.price?.amount ? `${activity.price.amount}-${Math.round(activity.price.amount * 1.3)}` : '120-150',
                rating: activity.rating || (Math.random() * 1.5 + 3.5)
              });
            }
          } catch (err: any) {
            console.warn(`Failed to fetch activities for ${location.name}:`, err);
            
            // If we hit rate limit, stop making more requests and use fallback
            if (err.response?.status === 429) {
              console.warn('Rate limit hit for activities, using fallback data');
              break;
            }
          }
        }

        // Use fetched experiences or fallback to default
        if (experiences.length === 0) {
          setExperiences(await getDefaultExperiences());
        } else {
          // Cache the successful results
          localStorage.setItem('cachedExperiences', JSON.stringify(experiences));
          localStorage.setItem('experiencesCacheTime', Date.now().toString());
          setExperiences(experiences);
        }
      } catch (err) {
        console.error('Error fetching featured experiences:', err);
        setError('Failed to load featured experiences');
        setExperiences(await getDefaultExperiences());
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedExperiences();
  }, []);

  const getDefaultExperiences = async (): Promise<FeaturedExperience[]> => {
    const defaultActivities = [
      {
        title: "Eiffel Tower Experience",
        location: "Paris, France",
        type: "Cultural Tour",
        duration: "3 hours",
        priceRange: "89-120",
        rating: 4.8
      },
      {
        title: "Desert Safari Adventure",
        location: "Dubai, UAE",
        type: "Adventure Tour",
        duration: "6 hours",
        priceRange: "95-130",
        rating: 4.7
      },
      {
        title: "Gondola Ride",
        location: "Venice, Italy",
        type: "Romantic Experience",
        duration: "45 minutes",
        priceRange: "80-100",
        rating: 4.6
      },
      {
        title: "Alpine Adventure",
        location: "Swiss Alps",
        type: "Nature Experience",
        duration: "Full day",
        priceRange: "150-200",
        rating: 4.9
      }
    ];

    const experiences = await Promise.all(
      defaultActivities.map(async (activity, index) => ({
        id: `featured-${index + 1}`,
        image: await imageService.getActivityImage(activity.title, activity.type, activity.location),
        title: activity.title,
        location: activity.location,
        type: activity.type,
        duration: activity.duration,
        priceRange: activity.priceRange,
        rating: activity.rating
      }))
    );

    return experiences;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Featured Experiences" 
            subtitle="Discover curated adventures tailored just for you"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Featured Experiences" 
            subtitle="Discover curated adventures tailored just for you"
          />
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="Featured Experiences" 
          subtitle="Discover curated adventures tailored just for you"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {experiences.map((exp, index) => (
            <ExperienceCard key={index} {...exp} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedExperiences;