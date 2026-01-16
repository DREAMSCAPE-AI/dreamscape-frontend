import React, { useState } from 'react';
import { Activity, Check } from 'lucide-react';
import ActivitySearch from '@/components/activities/ActivitySearch';

interface ActivitySearchWrapperProps {
  onSelectActivity: (activity: any) => void;
  selectedActivityId?: string;
}

const ActivitySearchWrapper: React.FC<ActivitySearchWrapperProps> = ({
  onSelectActivity,
  selectedActivityId
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (params: any) => {
    setIsSearching(true);
    // Mock results - replace with actual API
    setTimeout(() => {
      setSearchResults([
        {
          id: 'ACT001',
          name: 'Eiffel Tower Skip-the-Line Tour',
          location: params.location || 'Paris',
          date: params.date || new Date().toISOString(),
          duration: '3h',
          participants: params.adults || 2,
          description: 'Skip the line and enjoy a guided tour of the Eiffel Tower',
          price: { amount: 85, currencyCode: 'USD' }
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ActivitySearch onSearch={handleSearch} loading={isSearching} />
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Available Activities ({searchResults.length})</h3>
          {searchResults.map((activity) => (
            <div
              key={activity.id}
              onClick={() => onSelectActivity(activity)}
              className={`bg-white rounded-lg border-2 p-4 cursor-pointer hover:shadow-md ${
                selectedActivityId === activity.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">{activity.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{activity.location}</p>
                  <p className="text-sm text-gray-600">Duration: {activity.duration}</p>
                  {activity.description && (
                    <p className="text-sm text-gray-500 mt-2">{activity.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{activity.price.currencyCode} {activity.price.amount}</div>
                  {selectedActivityId === activity.id && (
                    <div className="flex items-center gap-2 text-orange-600 mt-2">
                      <Check className="w-5 h-5" />
                      <span>Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitySearchWrapper;
