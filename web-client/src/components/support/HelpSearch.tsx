import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Star, Clock } from 'lucide-react';

interface HelpSearchProps {
  initialQuery?: string;
}

const HelpSearch: React.FC<HelpSearchProps> = ({ initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const popularTopics = [
    'How to plan an itinerary',
    'Booking cancellation policy',
    'VR experience setup',
    'Payment methods',
    'Travel insurance'
  ];

  const searchResults = [
    {
      title: 'How to create and share travel plans',
      category: 'Planning',
      relevance: 98
    },
    {
      title: 'Understanding our booking protection',
      category: 'Policies',
      relevance: 95
    },
    {
      title: 'Using AI recommendations',
      category: 'Features',
      relevance: 92
    }
  ];

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      if (query && !recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev].slice(0, 5));
      }
    }, 500);
  };

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic);
    handleSearch(topic);
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !searchQuery && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleTopicClick(search)}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Topics */}
      {!searchQuery && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleTopicClick(topic)}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-500 transition-colors group"
              >
                <span className="text-gray-700 group-hover:text-orange-500">{topic}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && !isSearching && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          {searchResults.map((result, index) => (
            <button
              key={index}
              className="w-full p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-500 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium mb-1">{result.title}</h3>
                  <span className="text-sm text-gray-500">{result.category}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-orange-500">
                  <Star className="w-4 h-4 fill-orange-500" />
                  {result.relevance}% match
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      )}
    </div>
  );
};

export default HelpSearch;