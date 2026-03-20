import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Home, Compass, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ModalRecommendationType } from './AIRecommendationModal';

interface CategoryButton {
  id: ModalRecommendationType;
  labelKey: string;
  icon: React.ReactNode;
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
    { id: 'flights', labelKey: 'recommendations.aiSelector.categories.flights', icon: <Plane className="w-4 h-4" /> },
    { id: 'accommodations', labelKey: 'recommendations.aiSelector.categories.accommodations', icon: <Home className="w-4 h-4" /> },
    { id: 'activities', labelKey: 'recommendations.aiSelector.categories.activities', icon: <Compass className="w-4 h-4" /> },
    { id: 'itinerary', labelKey: 'recommendations.aiSelector.categories.global', icon: <Globe className="w-4 h-4" /> }
  ];

  return (
    <div className="py-6">
      {/* Compact header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl">
          <Sparkles className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-surface-900">
            {t('recommendations.aiSelector.title')}
          </h3>
          <p className="text-xs text-gray-400">
            {t('recommendations.aiSelector.description')}
          </p>
        </div>
      </div>

      {/* Inline category pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => {
          const isSelected = selected === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelected(category.id)}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-surface-100 text-gray-600 border border-surface-200/50 hover:border-orange-300 hover:bg-orange-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? t('recommendations.aiSelector.deselectCategory') : t('recommendations.aiSelector.selectCategory')} ${t(category.labelKey)}`}
            >
              {category.icon}
              <span>{t(category.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Generate button — disabled until a type is selected */}
      <motion.button
        whileHover={selected && !isLoading ? { scale: 1.02 } : {}}
        whileTap={selected && !isLoading ? { scale: 0.98 } : {}}
        onClick={() => selected && onGenerate(selected)}
        disabled={!selected || isLoading}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
          selected && !isLoading
            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
            : 'bg-surface-100 text-gray-400 cursor-not-allowed'
        }`}
        aria-label={isLoading ? t('recommendations.aiSelector.generating') : t('recommendations.aiSelector.generateButton')}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('recommendations.aiSelector.generating')}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>{t('recommendations.aiSelector.generateButton')}</span>
          </>
        )}
      </motion.button>

      {!selected && (
        <p className="text-xs text-gray-400 mt-2">{t('recommendations.aiSelector.selectHint')}</p>
      )}
    </div>
  );
};

export default AIRecommendationSelector;
// Keep the old export name for backward compat
export type { ModalRecommendationType as RecommendationCategory };
