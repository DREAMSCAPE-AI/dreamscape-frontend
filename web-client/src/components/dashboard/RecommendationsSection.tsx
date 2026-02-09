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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t('recommendations.forYou')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title={t('recommendations.refreshRecommendations')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="text-orange-500 hover:text-orange-600 transition-colors">
            {t('recommendations.viewAll')}
          </button>
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-700">{t('recommendations.recentSearches')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full hover:bg-orange-50 hover:text-orange-500 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-medium text-gray-700">{t('recommendations.aiRecommendations')}</h3>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('recommendations.noRecommendations')}</p>
            <p className="text-gray-400 text-sm mt-1">
              {t('recommendations.noRecommendationsHint')}
            </p>
          </div>
        )}
      </div>

      {recommendations.length > 4 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            {t('recommendations.viewAllCount', { count: recommendations.length })}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;