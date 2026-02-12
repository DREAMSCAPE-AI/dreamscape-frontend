import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, Sparkles, RefreshCw } from 'lucide-react';
import ExperienceCard from '../features/ExperienceCard';
import { TravelRecommendation } from '../../services/dashboardService';

interface RecommendationsSectionProps {
  recentSearches: string[];
  recommendations: TravelRecommendation[];
  onRefresh: () => Promise<void>;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recentSearches,
  recommendations,
  onRefresh
}) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-800">{t('recommendations.forYou')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title={t('recommendations.refreshRecommendations')}
            aria-label={t('recommendations.refreshRecommendations')}
          >
            <RefreshCw className="w-4 h-4 flex-shrink-0" />
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

        {recommendations.length > 0 ? (
          <>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto -mx-3 px-3 pb-2">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {recommendations.slice(0, 4).map((recommendation) => (
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
              {recommendations.slice(0, 4).map((recommendation) => (
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
          <div className="text-center py-6 md:py-8">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm md:text-base text-gray-500">{t('recommendations.noRecommendations')}</p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              {t('recommendations.noRecommendationsHint')}
            </p>
          </div>
        )}
      </div>

      {recommendations.length > 4 && (
        <div className="mt-4 md:mt-6 text-center">
          <button
            className="px-4 md:px-6 py-2.5 min-h-[48px] text-sm md:text-base font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            aria-label={t('recommendations.viewAllCount', { count: recommendations.length })}
          >
            {t('recommendations.viewAllCount', { count: recommendations.length })}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;