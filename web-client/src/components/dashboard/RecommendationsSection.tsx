import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Sparkles, RefreshCw } from 'lucide-react';
import ExperienceCard from '../features/ExperienceCard';
import AIRecommendationSelector from './AIRecommendationSelector';
import { TravelRecommendation } from '../../services/dashboardService';
import { getAllRecommendations, RecommendationCategory } from '../../services/aiRecommendationsService';
import { useAuth } from '../../services/auth/AuthService';
import axios from 'axios';

interface RecommendationsSectionProps {
  recentSearches: string[];
  recommendations: TravelRecommendation[];
  onRefresh: () => Promise<void>;
}

interface UserSearchData {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass?: string;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recentSearches,
  recommendations,
  onRefresh
}) => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [aiRecommendations, setAiRecommendations] = useState<TravelRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSearchData, setUserSearchData] = useState<UserSearchData | null>(null);

  // Fetch user's latest search from database
  useEffect(() => {
    const fetchUserSearchData = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem('auth-token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/search-history/recent?limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data && response.data.length > 0) {
          const latestSearch = response.data[0];
          setUserSearchData({
            origin: latestSearch.origin,
            destination: latestSearch.destination,
            departureDate: latestSearch.departureDate,
            returnDate: latestSearch.returnDate,
            passengers: latestSearch.passengers || { adults: 1, children: 0, infants: 0 },
            cabinClass: latestSearch.cabinClass || 'ECONOMY'
          });
        }
      } catch (err) {
        console.error('Failed to fetch user search data:', err);
        // Fallback to default values if no search history
        setUserSearchData({
          origin: 'PAR',
          destination: 'NYC',
          departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          passengers: { adults: 2, children: 0, infants: 0 },
          cabinClass: 'ECONOMY'
        });
      }
    };

    fetchUserSearchData();
  }, [user?.id]);

  const handleGenerateRecommendations = async (categories: RecommendationCategory[]) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!userSearchData) {
      setError('No search data available. Please perform a search first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const searchParams = {
        origin: userSearchData.origin,
        destination: userSearchData.destination,
        departureDate: userSearchData.departureDate,
        adults: userSearchData.passengers?.adults || 1,
        children: userSearchData.passengers?.children || 0,
        infants: userSearchData.passengers?.infants || 0,
        travelClass: userSearchData.cabinClass,
        startDate: userSearchData.departureDate,
        endDate: userSearchData.returnDate || userSearchData.departureDate,
        checkInDate: userSearchData.departureDate,
        checkOutDate: userSearchData.returnDate,
        rooms: 1
      };

      const results = await getAllRecommendations(user.id, categories, searchParams);

      // Transform AI recommendations to TravelRecommendation format
      const transformedRecommendations: TravelRecommendation[] = [];

      // Process flights
      if (results.flights?.success) {
        results.flights.data.recommendations.forEach((flight: any) => {
          transformedRecommendations.push({
            id: flight.flightOfferId,
            type: 'flight',
            title: `${flight.origin} → ${flight.destination}`,
            description: `${flight.airline} - ${flight.duration} - ${flight.segments.length} segment(s)`,
            location: flight.destination,
            price: flight.price,
            currency: flight.currency,
            rating: Math.min(5, (flight.score * 5) || 4.5),
            image: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80`,
            tags: [flight.cabinClass, flight.bookingClass],
            validUntil: flight.validUntil,
            confidence: flight.score || 0.85
          });
        });
      }

      // Process activities
      if (results.activities?.success) {
        results.activities.data.recommendations.forEach((activity: any) => {
          transformedRecommendations.push({
            id: activity.id,
            type: 'activity',
            title: activity.name,
            description: activity.shortDescription,
            location: activity.location?.address || activity.geoCode?.label || '',
            price: activity.price?.amount || 0,
            currency: activity.price?.currencyCode || 'USD',
            rating: activity.rating || 4.5,
            image: activity.pictures?.[0] || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80`,
            tags: [activity.bookingLink ? 'bookable' : 'info-only'],
            validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            confidence: activity.score || 0.8
          });
        });
      }

      // TODO: Process accommodations when implemented
      if (results.accommodations?.success) {
        // Accommodation processing will go here
      }

      setAiRecommendations(transformedRecommendations);
    } catch (err: any) {
      console.error('Failed to generate recommendations:', err);
      setError(err.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = async () => {
    // Clear AI recommendations and trigger refresh
    setAiRecommendations([]);
    await onRefresh();
  };

  // Use AI recommendations if available, otherwise use default recommendations
  const displayRecommendations = aiRecommendations.length > 0 ? aiRecommendations : recommendations;

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-800">{t('recommendations.forYou')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isGenerating}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('recommendations.refreshRecommendations')}
            aria-label={t('recommendations.refreshRecommendations')}
          >
            <RefreshCw className={`w-4 h-4 flex-shrink-0 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="hidden sm:block min-h-[44px] px-3 text-sm md:text-base text-orange-500 hover:text-orange-600 transition-colors"
            aria-label={t('recommendations.viewAll')}
          >
            {t('recommendations.viewAll')}
          </button>
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <History className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-gray-500" />
            <h3 className="text-base md:text-lg font-medium text-gray-700">{t('recommendations.recentSearches')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                className="px-3 md:px-4 py-2 min-h-[44px] text-sm md:text-base bg-gray-50 text-gray-700 rounded-full hover:bg-orange-50 hover:text-orange-500 transition-colors"
                aria-label={`${t('recommendations.searchAgain')} ${search}`}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-orange-500" />
          <h3 className="text-base md:text-lg font-medium text-gray-700">{t('recommendations.aiRecommendations')}</h3>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {displayRecommendations.length > 0 ? (
          <>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto -mx-3 px-3 pb-2">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {displayRecommendations.slice(0, 4).map((recommendation) => (
                  <div key={recommendation.id} className="w-[280px] flex-shrink-0">
                    <ExperienceCard
                      image={recommendation.image}
                      title={recommendation.title}
                      location={recommendation.location}
                      type={recommendation.type}
                      duration={recommendation.description}
                      priceRange={`${recommendation.price}`}
                      rating={recommendation.rating}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              {displayRecommendations.slice(0, 4).map((recommendation) => (
                <ExperienceCard
                  key={recommendation.id}
                  image={recommendation.image}
                  title={recommendation.title}
                  location={recommendation.location}
                  type={recommendation.type}
                  duration={recommendation.description}
                  priceRange={`${recommendation.price}`}
                  rating={recommendation.rating}
                />
              ))}
            </div>
          </>
        ) : (
          <AIRecommendationSelector
            onGenerate={handleGenerateRecommendations}
            isLoading={isGenerating}
          />
        )}
      </div>

      {displayRecommendations.length > 4 && (
        <div className="mt-4 md:mt-6 text-center">
          <button
            className="px-4 md:px-6 py-2.5 min-h-[48px] text-sm md:text-base font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            aria-label={t('recommendations.viewAllCount', { count: displayRecommendations.length })}
          >
            {t('recommendations.viewAllCount', { count: displayRecommendations.length })}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;
