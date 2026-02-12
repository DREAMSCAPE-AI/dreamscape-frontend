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
}

const AIRecommendationSelector: React.FC<AIRecommendationSelectorProps> = ({
  onGenerate,
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

          return (
            <button
              key={category.id}
              onClick={() => handleToggle(category.id)}
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
                  </svg>
                </div>
              )}

              <div className={`${isSelected ? category.color : 'text-gray-400'} transition-colors`}>
                {category.icon}
              </div>

              <span className="text-sm md:text-base font-medium">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Generate Button */}
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
    </div>
  );
};

export default AIRecommendationSelector;
export type { UIRecommendationCategory as RecommendationCategory };
