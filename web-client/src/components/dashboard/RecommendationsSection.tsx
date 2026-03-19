import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import ExperienceCard from '../features/ExperienceCard';
import AIRecommendationSelector from './AIRecommendationSelector';
import { TravelRecommendation } from '@/services/dashboard';
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
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState<TravelRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [userSearchData, setUserSearchData] = useState<UserSearchData | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-50px' });

  useEffect(() => {
    const fetchUserSearchData = async () => {
      if (!user?.id) return;
      try {
        const token = localStorage.getItem('auth-token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/search-history/recent?limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
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
        setUserSearchData({
          origin: 'PAR', destination: 'NYC',
          departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          passengers: { adults: 2, children: 0, infants: 0 },
          cabinClass: 'ECONOMY'
        });
      }
    };
    fetchUserSearchData();
  }, [user?.id]);

  const handleGenerateRecommendations = async (categories: RecommendationCategory[]) => {
    if (!user?.id) { setError('User not authenticated'); return; }
    if (!userSearchData) { setError('No search data available. Please perform a search first.'); return; }

    setIsGenerating(true);
    setError(null);
    try {
      const searchParams = {
        origin: userSearchData.origin, destination: userSearchData.destination,
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
      const transformed: TravelRecommendation[] = [];

      if (results.flights?.success) {
        results.flights.data.recommendations.forEach((flight: any) => {
          transformed.push({
            id: flight.flightOfferId, type: 'flight',
            title: `${flight.origin} → ${flight.destination}`,
            description: `${flight.airline} - ${flight.duration} - ${flight.segments.length} segment(s)`,
            location: flight.destination, price: flight.price, currency: flight.currency,
            rating: Math.min(5, (flight.score * 5) || 4.5),
            image: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80`,
            tags: [flight.cabinClass, flight.bookingClass],
            validUntil: flight.validUntil, confidence: flight.score || 0.85
          });
        });
      }
      if (results.activities?.success) {
        results.activities.data.recommendations.forEach((activity: any) => {
          transformed.push({
            id: activity.id, type: 'activity', title: activity.name,
            description: activity.shortDescription,
            location: activity.location?.address || activity.geoCode?.label || '',
            price: activity.price?.amount || 0, currency: activity.price?.currencyCode || 'USD',
            rating: activity.rating || 4.5,
            image: activity.pictures?.[0] || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80`,
            tags: [activity.bookingLink ? 'bookable' : 'info-only'],
            validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            confidence: activity.score || 0.8
          });
        });
      }
      if (results.accommodations?.success) { /* Future */ }
      setAiRecommendations(transformed);
    } catch (err: any) {
      console.error('Failed to generate recommendations:', err);
      setError(err.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = async () => { setAiRecommendations([]); await onRefresh(); };
  const displayRecommendations = aiRecommendations.length > 0 ? aiRecommendations : recommendations;

  return (
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-surface-900">{t('recommendations.forYou')}</h2>
          </div>
          <p className="text-sm text-gray-400 ml-7">Personalized suggestions powered by AI</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isGenerating}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-50"
          title={t('recommendations.refreshRecommendations')}
          aria-label={t('recommendations.refreshRecommendations')}
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-gray-400">{t('recommendations.recentSearches')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => navigate(`/flights?destination=${encodeURIComponent(search)}`)}
                className="px-3 py-1.5 text-sm bg-surface-100 text-surface-900 rounded-full border border-surface-200/50 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
                aria-label={`${t('recommendations.searchAgain')} ${search}`}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div ref={gridRef}>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {displayRecommendations.length > 0 ? (
          <>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto -mx-5 px-5 pb-2">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {displayRecommendations.slice(0, showAll ? undefined : 4).map((rec) => (
                  <div key={rec.id} className="w-[280px] flex-shrink-0">
                    <ExperienceCard
                      image={rec.image} title={rec.title} location={rec.location}
                      type={rec.type} duration={rec.description}
                      priceRange={`${rec.price}`} rating={rec.rating}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: Grid with stagger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="hidden md:grid grid-cols-2 gap-4"
            >
              {displayRecommendations.slice(0, showAll ? undefined : 4).map((rec) => (
                <ExperienceCard
                  key={rec.id} image={rec.image} title={rec.title} location={rec.location}
                  type={rec.type} duration={rec.description}
                  priceRange={`${rec.price}`} rating={rec.rating}
                />
              ))}
            </motion.div>
          </>
        ) : (
          <AIRecommendationSelector
            onGenerate={handleGenerateRecommendations}
            isLoading={isGenerating}
          />
        )}
      </div>

      {/* View All */}
      {displayRecommendations.length > 4 && !showAll && (
        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
            aria-label={t('recommendations.viewAllCount', { count: displayRecommendations.length })}
          >
            {t('recommendations.viewAllCount', { count: displayRecommendations.length })}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;
