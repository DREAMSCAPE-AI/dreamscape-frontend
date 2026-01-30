import React, { useState, useCallback } from 'react';
import { Star, Clock, Users, Calendar, MapPin } from 'lucide-react';
import imageService from '@/services/imageService';
import { useHistoryTracking } from '@/hooks/useHistoryTracking';

export interface Activity {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  location: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviewCount: number;
  duration: string;
  groupSize: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  images: string[];
  category: string;
  tags: string[];
  availability: {
    available: boolean;
    nextAvailable?: string;
  };
  bookingInfo: {
    instantConfirmation: boolean;
    freeCancellation: boolean;
    cancellationPolicy: string;
  };
}

interface ActivityResultsProps {
  activities: Activity[];
  loading?: boolean;
  onSelect?: (activity: Activity) => void;
}

const ActivityResults: React.FC<ActivityResultsProps> = ({
  activities,
  loading = false,
  onSelect
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // History tracking
  const { trackActivityView } = useHistoryTracking();

  const handleActivitySelect = useCallback((activity: Activity) => {
    // Track activity view
    trackActivityView(activity.id, activity.name);
    // Call the original onSelect
    if (onSelect) {
      onSelect(activity);
    }
  }, [onSelect, trackActivityView]);

  // Pagination logic
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedActivities = activities.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
        <p className="text-gray-600">
          Try adjusting your search criteria or explore different locations.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activities.length} Activities Found
          </h2>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600 mt-1">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {paginatedActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
            onClick={() => handleActivitySelect(activity)}
          >
            {/* Activity Image */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {activity.images.length > 0 ? (
                <img
                  src={activity.images[0]}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = imageService.getFallbackImage('activity');
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
              )}

              {/* Availability Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.availability.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {activity.availability.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            {/* Activity Info */}
            <div className="p-4">
              {/* Category Tag */}
              <div className="mb-2">
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {activity.category}
                </span>
              </div>

              {/* Activity Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {activity.name}
              </h3>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{activity.location.name}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-sm font-medium text-gray-900 mr-1">
                  {activity.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">
                  ({activity.reviewCount} reviews)
                </span>
              </div>

              {/* Activity Details */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="truncate">{activity.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="truncate">{activity.groupSize}</span>
                </div>
              </div>

              {/* Booking Info */}
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                {activity.bookingInfo.instantConfirmation && (
                  <span className="flex items-center">
                    ⚡ Instant Confirmation
                  </span>
                )}
                {activity.bookingInfo.freeCancellation && (
                  <span className="flex items-center">
                    ✓ Free Cancellation
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-600">From</span>
                  <div className="text-xl font-bold text-gray-900">
                    {activity.price.formatted}
                  </div>
                  <span className="text-xs text-gray-600">per person</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect && onSelect(activity);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === page
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 py-2">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityResults;
