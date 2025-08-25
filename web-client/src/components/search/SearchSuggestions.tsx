import React from 'react';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';

interface SearchSuggestionsProps {
  location: string;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ location }) => {
  const suggestions = [
    {
      type: 'alternative',
      title: 'Similar to your search',
      items: ['Barcelona, Spain', 'Nice, France', 'Florence, Italy']
    },
    {
      type: 'trending',
      title: 'Trending nearby',
      items: ['Provence, France', 'Swiss Alps', 'Amalfi Coast, Italy']
    }
  ];

  if (!location) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold">AI-Powered Suggestions</h2>
      </div>

      <div className="space-y-6">
        {suggestions.map((section) => (
          <div key={section.type}>
            <div className="flex items-center gap-2 mb-3">
              {section.type === 'trending' ? (
                <TrendingUp className="w-4 h-4 text-orange-400" />
              ) : (
                <Clock className="w-4 h-4 text-orange-400" />
              )}
              <h3 className="text-sm font-medium text-gray-700">{section.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.items.map((item) => (
                <button
                  key={item}
                  className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchSuggestions;