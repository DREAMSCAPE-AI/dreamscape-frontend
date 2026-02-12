<<<<<<< HEAD
/**
 * AI Recommendation Selector Component
 *
 * Allows users to select recommendation types (flights, accommodations, activities)
 * and generate personalized AI recommendations.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Home, MapPin, Sparkles, Loader2 } from 'lucide-react';

export type RecommendationCategory = 'flights' | 'accommodations' | 'activities' | 'global';

interface AIRecommendationSelectorProps {
  onGenerate: (selectedCategories: RecommendationCategory[]) => Promise<void>;
  loading?: boolean;
=======
import React from 'react';
import { Plane, Home, Compass, Globe, Sparkles } from 'lucide-react';
import { RecommendationCategory as APIRecommendationCategory } from '../../services/aiRecommendationsService';

// UI type includes 'global' for convenience
type UIRecommendationCategory = APIRecommendationCategory | 'global';

interface CategoryButton {
  id: UIRecommendationCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverBg: string;
}

interface AIRecommendationSelectorProps {
  onGenerate: (categories: APIRecommendationCategory[]) => void;
  isLoading?: boolean;
>>>>>>> dev
}

const AIRecommendationSelector: React.FC<AIRecommendationSelectorProps> = ({
  onGenerate,
<<<<<<< HEAD
  loading = false,
}) => {
  const { t } = useTranslation('dashboard');
  const [selected, setSelected] = useState<Set<RecommendationCategory>>(new Set());

  const categories = [
    {
      id: 'flights' as RecommendationCategory,
      icon: Plane,
      label: t('recommendations.categories.flights', 'Vols'),
      color: 'blue',
    },
    {
      id: 'accommodations' as RecommendationCategory,
      icon: Home,
      label: t('recommendations.categories.accommodations', 'Hébergement'),
      color: 'green',
    },
    {
      id: 'activities' as RecommendationCategory,
      icon: MapPin,
      label: t('recommendations.categories.activities', 'Activités'),
      color: 'purple',
    },
    {
      id: 'global' as RecommendationCategory,
      icon: Sparkles,
      label: t('recommendations.categories.global', 'Global'),
      color: 'orange',
    },
  ];

  const handleToggle = (categoryId: RecommendationCategory) => {
    setSelected(prev => {
      const newSelected = new Set(prev);

      if (categoryId === 'global') {
        // Toggle all
        if (newSelected.has('global')) {
          // Deselect all
          newSelected.clear();
        } else {
          // Select all
          categories.forEach(cat => newSelected.add(cat.id));
        }
      } else {
        // Toggle individual category
        if (newSelected.has(categoryId)) {
          newSelected.delete(categoryId);
          newSelected.delete('global'); // Deselect global if individual is deselected
        } else {
          newSelected.add(categoryId);
          // Check if all non-global categories are selected
          const nonGlobalCategories = categories.filter(c => c.id !== 'global');
          const allSelected = nonGlobalCategories.every(c =>
            c.id === categoryId || newSelected.has(c.id)
          );
          if (allSelected) {
            newSelected.add('global');
          }
        }
      }

      return newSelected;
    });
  };

  const handleGenerate = async () => {
    if (selected.size === 0 || loading) return;

    const categoriesToGenerate = Array.from(selected).filter(c => c !== 'global');

    // If global is selected, include all categories
    const finalCategories = selected.has('global')
      ? ['flights', 'accommodations', 'activities'] as RecommendationCategory[]
      : categoriesToGenerate;

    await onGenerate(finalCategories);
  };

  const isSelected = (categoryId: RecommendationCategory) => selected.has(categoryId);
  const hasSelection = selected.size > 0;

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { border: string; bg: string; text: string; hover: string }> = {
      blue: {
        border: 'border-blue-500',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hover: 'hover:border-blue-300 hover:bg-blue-50',
      },
      green: {
        border: 'border-green-500',
        bg: 'bg-green-50',
        text: 'text-green-600',
        hover: 'hover:border-green-300 hover:bg-green-50',
      },
      purple: {
        border: 'border-purple-500',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        hover: 'hover:border-purple-300 hover:bg-purple-50',
      },
      orange: {
        border: 'border-orange-500',
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hover: 'hover:border-orange-300 hover:bg-orange-50',
      },
    };

    const colors = colorMap[color] || colorMap.blue;

    return isSelected
      ? `${colors.border} ${colors.bg} shadow-md scale-105`
      : `border-gray-200 bg-white ${colors.hover}`;
  };

  return (
    <div className="space-y-6">
      {/* Category Selection Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const selected = isSelected(category.id);
=======
  isLoading = false
}) => {
  const [selectedCategories, setSelectedCategories] = React.useState<Set<UIRecommendationCategory>>(new Set());

  const categories: CategoryButton[] = [
    {
      id: 'flights',
      label: 'Vols',
      icon: <Plane className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100'
    },
    {
      id: 'accommodations',
      label: 'Hébergement',
      icon: <Home className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBg: 'hover:bg-green-100'
    },
    {
      id: 'activities',
      label: 'Activités',
      icon: <Compass className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100'
    },
    {
      id: 'global',
      label: 'Global',
      icon: <Globe className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100'
    }
  ];

  const handleToggle = (categoryId: UIRecommendationCategory) => {
    const newSelected = new Set(selectedCategories);

    if (categoryId === 'global') {
      // If global is being toggled
      if (newSelected.has('global')) {
        // Deselect all
        newSelected.clear();
      } else {
        // Select all
        categories.forEach(cat => newSelected.add(cat.id));
      }
    } else {
      // Toggle individual category
      if (newSelected.has(categoryId)) {
        newSelected.delete(categoryId);
        newSelected.delete('global'); // Deselect global if an individual is deselected
      } else {
        newSelected.add(categoryId);

        // Check if all individual categories are now selected
        const individualCategories = categories.filter(c => c.id !== 'global');
        const allIndividualSelected = individualCategories.every(c => newSelected.has(c.id));

        if (allIndividualSelected) {
          newSelected.add('global');
        }
      }
    }

    setSelectedCategories(newSelected);
  };

  const handleGenerate = () => {
    // Filter out 'global' as it's just a UI convenience
    const categoriesToGenerate = Array.from(selectedCategories).filter(c => c !== 'global');

    // If all are selected or global was selected, send all three actual categories
    if (selectedCategories.has('global') || categoriesToGenerate.length === 3) {
      onGenerate(['flights', 'accommodations', 'activities']);
    } else {
      onGenerate(categoriesToGenerate);
    }
  };

  const hasSelection = selectedCategories.size > 0 &&
    (selectedCategories.has('global') || Array.from(selectedCategories).some(c => c !== 'global'));

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <div className="text-center mb-6">
        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Générez vos recommandations IA
        </h3>
        <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
          Sélectionnez les types de recommandations que vous souhaitez recevoir
        </p>
      </div>

      {/* Category Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 w-full max-w-3xl px-4">
        {categories.map((category) => {
          const isSelected = selectedCategories.has(category.id);
>>>>>>> dev

          return (
            <button
              key={category.id}
              onClick={() => handleToggle(category.id)}
<<<<<<< HEAD
              disabled={loading}
              className={`
                relative min-h-[120px] p-4 rounded-xl border-2 transition-all duration-200
                ${getColorClasses(category.color, selected)}
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                flex flex-col items-center justify-center gap-3
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${category.color}-500
              `}
              aria-pressed={selected}
              aria-label={`${selected ? t('recommendations.deselect') : t('recommendations.select')} ${category.label}`}
            >
              {/* Selection Indicator */}
              {selected && (
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-${category.color}-500 flex items-center justify-center`}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
=======
              disabled={isLoading}
              className={`
                relative flex flex-col items-center justify-center gap-2 p-4 md:p-6
                rounded-xl border-2 transition-all duration-200 min-h-[100px] md:min-h-[120px]
                ${isSelected
                  ? `${category.bgColor} border-current ${category.color} shadow-md scale-105`
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              `}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${category.label}`}
            >
              {/* Checkmark indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-current flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
>>>>>>> dev
                  </svg>
                </div>
              )}

<<<<<<< HEAD
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${selected ? `bg-${category.color}-100` : 'bg-gray-100'}
                transition-colors
              `}>
                <Icon className={`
                  w-6 h-6
                  ${selected ? `text-${category.color}-600` : 'text-gray-500'}
                `} />
              </div>

              {/* Label */}
              <span className={`
                text-sm md:text-base font-medium text-center
                ${selected ? `text-${category.color}-700` : 'text-gray-700'}
              `}>
=======
              <div className={`${isSelected ? category.color : 'text-gray-400'} transition-colors`}>
                {category.icon}
              </div>

              <span className="text-sm md:text-base font-medium">
>>>>>>> dev
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Generate Button */}
<<<<<<< HEAD
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={!hasSelection || loading}
          className={`
            w-full md:w-auto px-8 py-4 rounded-xl font-semibold text-base
            transition-all duration-200 flex items-center justify-center gap-3
            ${hasSelection && !loading
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
          `}
          aria-label={t('recommendations.generateButton')}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('recommendations.generating', 'Génération en cours...')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t('recommendations.generateButton', 'Générer mes recommandations')}</span>
            </>
          )}
        </button>

        {hasSelection && !loading && (
          <p className="text-xs md:text-sm text-gray-500 text-center">
            {selected.has('global')
              ? t('recommendations.generatingAllHint', 'Recommandations complètes pour vols, hébergement et activités')
              : t('recommendations.generatingSelectedHint', {
                  count: selected.size,
                  categories: Array.from(selected)
                    .filter(c => c !== 'global')
                    .map(c => categories.find(cat => cat.id === c)?.label)
                    .join(', ')
                })
            }
          </p>
        )}
      </div>
=======
      <button
        onClick={handleGenerate}
        disabled={!hasSelection || isLoading}
        className={`
          px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-base md:text-lg
          transition-all duration-200 min-h-[48px] md:min-w-[280px]
          ${hasSelection && !isLoading
            ? 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg transform hover:scale-105'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        aria-label={isLoading ? 'Génération en cours...' : 'Générer mes recommandations'}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Génération en cours...</span>
          </div>
        ) : (
          <>
            <Sparkles className="inline-block w-5 h-5 mr-2" />
            Générer mes recommandations
          </>
        )}
      </button>

      {/* Selection hint */}
      {!hasSelection && (
        <p className="text-xs md:text-sm text-gray-400 mt-3">
          Sélectionnez au moins une catégorie pour continuer
        </p>
      )}
>>>>>>> dev
    </div>
  );
};

export default AIRecommendationSelector;
