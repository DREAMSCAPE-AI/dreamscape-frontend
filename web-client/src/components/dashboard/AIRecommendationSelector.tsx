import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Home, Compass, Globe, Sparkles } from 'lucide-react';
import type { ModalRecommendationType } from './AIRecommendationModal';

interface CategoryButton {
  id: ModalRecommendationType;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  selectedBorder: string;
}

interface AIRecommendationSelectorProps {
  onGenerate: (type: ModalRecommendationType) => void;
  isLoading?: boolean;
}

const AIRecommendationSelector: React.FC<AIRecommendationSelectorProps> = ({
  onGenerate,
  isLoading = false
}) => {
  const { t } = useTranslation('dashboard');
  const [selected, setSelected] = React.useState<ModalRecommendationType | null>(null);

  const categories: CategoryButton[] = [
    {
      id: 'flights',
      labelKey: 'recommendations.aiSelector.categories.flights',
      icon: <Plane className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      selectedBorder: 'border-blue-400',
    },
    {
      id: 'accommodations',
      labelKey: 'recommendations.aiSelector.categories.accommodations',
      icon: <Home className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      selectedBorder: 'border-green-400',
    },
    {
      id: 'activities',
      labelKey: 'recommendations.aiSelector.categories.activities',
      icon: <Compass className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      selectedBorder: 'border-purple-400',
    },
    {
      id: 'itinerary',
      labelKey: 'recommendations.aiSelector.categories.global',
      icon: <Globe className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      selectedBorder: 'border-orange-400',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <div className="text-center mb-6">
        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          {t('recommendations.aiSelector.title')}
        </h3>
        <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
          {t('recommendations.aiSelector.description')}
        </p>
      </div>

      {/* Single-select category grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 w-full max-w-3xl px-4">
        {categories.map((category) => {
          const isSelected = selected === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelected(category.id)}
              disabled={isLoading}
              className={`
                relative flex flex-col items-center justify-center gap-2 p-4 md:p-6
                rounded-xl border-2 transition-all duration-200 min-h-[100px] md:min-h-[120px]
                ${isSelected
                  ? `${category.bgColor} ${category.selectedBorder} ${category.color} shadow-md scale-105`
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm hover:scale-105'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              role="radio"
              aria-checked={isSelected}
              aria-label={t(category.labelKey)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-current flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className={`${isSelected ? category.color : 'text-gray-400'} transition-colors`}>
                {category.icon}
              </div>
              <span className="text-sm md:text-base font-medium">
                {t(category.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Generate button — disabled until a type is selected */}
      <button
        onClick={() => selected && onGenerate(selected)}
        disabled={!selected || isLoading}
        className={`
          px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-base md:text-lg
          transition-all duration-200 min-h-[48px] md:min-w-[280px]
          ${selected && !isLoading
            ? 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg transform hover:scale-105'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        aria-label={t('recommendations.aiSelector.generateButton')}
      >
        <Sparkles className="inline-block w-5 h-5 mr-2" />
        {t('recommendations.aiSelector.generateButton')}
      </button>

      {!selected && (
        <p className="text-xs md:text-sm text-gray-400 mt-3">
          {t('recommendations.aiSelector.selectHint')}
        </p>
      )}
    </div>
  );
};

export default AIRecommendationSelector;
// Keep the old export name for backward compat
export type { ModalRecommendationType as RecommendationCategory };
