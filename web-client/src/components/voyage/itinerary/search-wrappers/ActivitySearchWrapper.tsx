import React, { useState } from 'react';
import { Activity, Check } from 'lucide-react';
import ActivitySearch from '@/components/activities/ActivitySearch';
import voyageService from '@/services/voyage/VoyageService';

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
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: any) => {
    setIsSearching(true);
    setError(null);

    try {
      // Convert location name to coordinates
      // Mapping for supported cities (same as ActivitySearch component)
      const cityCoordinates: Record<string, { lat: number; lng: number }> = {
        'Paris': { lat: 48.8566, lng: 2.3522 },
        'London': { lat: 51.5074, lng: -0.1278 },
        'Barcelona': { lat: 41.3851, lng: 2.1734 },
        'Berlin': { lat: 52.5200, lng: 13.4050 },
        'New York': { lat: 40.7128, lng: -74.0060 },
        'San Francisco': { lat: 37.7749, lng: -122.4194 },
        'Dallas': { lat: 32.7767, lng: -96.7970 },
        'Bangalore': { lat: 12.9716, lng: 77.5946 },
        'Tokyo': { lat: 35.6762, lng: 139.6503 },
        'Dubai': { lat: 25.2048, lng: 55.2708 },
        'Bangkok': { lat: 13.7563, lng: 100.5018 },
        'Rome': { lat: 41.9028, lng: 12.4964 },
        'Amsterdam': { lat: 52.3676, lng: 4.9041 },
        'Singapore': { lat: 1.3521, lng: 103.8198 }
      };

      // Get coordinates from location name or use Paris as default
      const coords = params.location
        ? cityCoordinates[params.location] || { lat: 48.8566, lng: 2.3522 }
        : { lat: 48.8566, lng: 2.3522 };

      console.log(`[ActivitySearchWrapper] Searching for "${params.location}" at coordinates:`, coords);

      // Call real Amadeus API via VoyageService
      const result = await voyageService.searchActivities({
        latitude: coords.lat,
        longitude: coords.lng,
        radius: params.radius || 20
      });

      // Debug: Check API response structure
      console.log('[ActivitySearchWrapper] Raw result:', result);
      console.log('[ActivitySearchWrapper] result.data:', result?.data);
      console.log('[ActivitySearchWrapper] result.data.data:', result?.data?.data);

      // Handle both result.data and result.data.data
      const activities = result?.data?.data || result?.data || [];
      console.log('[ActivitySearchWrapper] Extracted activities array:', activities);
      console.log('[ActivitySearchWrapper] API returned activities:', activities.length);

      setSearchResults(activities);
    } catch (err) {
      setError('Failed to search activities. Please try again.');
      console.error('Activity search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ActivitySearch onSearch={handleSearch} loading={isSearching} />
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Available Activities ({searchResults.length})</h3>
          {searchResults.map((activity) => {
            // Extract activity data properly
            const activityName = activity.name || 'Unknown Activity';

            // Location - intelligent detection
            let locationDisplay = 'Unknown Location';
            if (activity.location?.name) {
              locationDisplay = activity.location.name;
            } else if (activity.geoCode?.latitude && activity.geoCode?.longitude) {
              locationDisplay = `${activity.geoCode.latitude}, ${activity.geoCode.longitude}`;
            }

            // Duration
            const duration = activity.duration || '2h';

            // Description
            const description = activity.shortDescription || activity.description || '';

            // Price
            const price = activity.price?.amount || '0';
            const currency = activity.price?.currencyCode || 'USD';

            return (
              <div
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className={`bg-white rounded-lg border-2 p-4 cursor-pointer hover:shadow-md ${
                  selectedActivityId === activity.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold">{activityName}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{locationDisplay}</p>
                    <p className="text-sm text-gray-600">Duration: {duration}</p>
                    {description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold">{currency} {price}</div>
                    {selectedActivityId === activity.id && (
                      <div className="flex items-center gap-2 text-orange-600 mt-2">
                        <Check className="w-5 h-5" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivitySearchWrapper;
