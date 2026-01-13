import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Heart,
  Trash2,
  AlertTriangle,
  X,
  ChevronLeft,
  Edit3,
  Plane,
  Hotel,
  MapPin,
  Calendar,
  Activity,
  Plus,
  Tag,
  StickyNote,
} from 'lucide-react';
import { useAuth } from '@/services/auth/AuthService';
import { favoritesService } from '@/services/favoritesService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import AddFavoriteModal from '@/components/favorites/AddFavoriteModal';
import EditFavoriteModal from '@/components/favorites/EditFavoriteModal';
import type { Favorite, FavoriteType, FavoriteFilterParams } from '@/types/favorites';

// Icon mapping for entity types
const entityIcons: Record<FavoriteType, React.ElementType> = {
  FLIGHT: Plane,
  HOTEL: Hotel,
  DESTINATION: MapPin,
  BOOKING: Calendar,
  ACTIVITY: Activity,
};

// Color mapping for entity types
const entityColors: Record<FavoriteType, string> = {
  FLIGHT: 'bg-blue-100 text-blue-700 border-blue-200',
  HOTEL: 'bg-purple-100 text-purple-700 border-purple-200',
  ACTIVITY: 'bg-green-100 text-green-700 border-green-200',
  DESTINATION: 'bg-orange-100 text-orange-700 border-orange-200',
  BOOKING: 'bg-red-100 text-red-700 border-red-200',
};

const entityBadgeColors: Record<FavoriteType, string> = {
  FLIGHT: 'bg-blue-500',
  HOTEL: 'bg-purple-500',
  ACTIVITY: 'bg-green-500',
  DESTINATION: 'bg-orange-500',
  BOOKING: 'bg-red-500',
};

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);

  // Filters
  const [activeFilter, setActiveFilter] = useState<FavoriteType | 'ALL'>('ALL');
  const [filters, setFilters] = useState<FavoriteFilterParams>({
    page: 1,
    limit: 50,
  });

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch favorites data
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoritesService.getFavorites(filters);
      setFavorites(response.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites on mount and when filters change
  useEffect(() => {
    fetchFavorites();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (type: FavoriteType | 'ALL') => {
    setActiveFilter(type);
    if (type === 'ALL') {
      setFilters({ page: 1, limit: 50 });
    } else {
      setFilters({ page: 1, limit: 50, entityType: type });
    }
  };

  // Handle delete favorite
  const handleDelete = async (id: string) => {
    try {
      await favoritesService.deleteFavorite(id);
      setDeleteConfirm(null);
      fetchFavorites(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete favorite');
    }
  };

  // Handle edit favorite
  const handleEdit = (favorite: Favorite) => {
    setSelectedFavorite(favorite);
    setEditModalOpen(true);
  };

  // Get entity display name from entityData
  const getEntityName = (favorite: Favorite): string => {
    const data = favorite.entityData;
    if (data.name) return data.name;
    if (data.title) return data.title;
    if (data.hotelName) return data.hotelName;
    if (data.destinationName) return data.destinationName;
    if (data.flightNumber) return `Flight ${data.flightNumber}`;
    if (data.activityName) return data.activityName;
    return favorite.entityId;
  };

  // Get entity description from entityData
  const getEntityDescription = (favorite: Favorite): string | null => {
    const data = favorite.entityData;
    if (data.description) return data.description;
    if (data.location) return data.location;
    if (data.city) return data.city;
    if (data.destination) return data.destination;
    return null;
  };

  // Filter favorites by type
  const filteredFavorites = favorites;

  // Group favorites by type for counts
  const favoritesCounts = favorites.reduce((acc, fav) => {
    acc[fav.entityType] = (acc[fav.entityType] || 0) + 1;
    return acc;
  }, {} as Record<FavoriteType, number>);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                {favorites.length > 0 && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    {favorites.length}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">Save and organize your favorite travel items</p>
            </div>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Favorite
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
                ${activeFilter === 'ALL'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              All ({favorites.length})
            </button>
            {(['FLIGHT', 'HOTEL', 'ACTIVITY', 'DESTINATION', 'BOOKING'] as FavoriteType[]).map((type) => {
              const Icon = entityIcons[type];
              const count = favoritesCounts[type] || 0;
              return (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap
                    ${activeFilter === type
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {type.charAt(0) + type.slice(1).toLowerCase()}s ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <LoadingSpinner text="Loading your favorites..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <ErrorMessage message={error} onRetry={fetchFavorites} />
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <Heart className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              {activeFilter !== 'ALL'
                ? `You haven't favorited any ${activeFilter.toLowerCase()}s yet.`
                : 'Start saving your favorite travel items to access them quickly later.'}
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Favorite
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => {
              const Icon = entityIcons[favorite.entityType];
              const colorClass = entityColors[favorite.entityType];
              const badgeColor = entityBadgeColors[favorite.entityType];

              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
                >
                  {/* Header with type badge */}
                  <div className={`px-4 py-3 ${colorClass} border-b`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">
                          {favorite.entityType}
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${badgeColor}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {getEntityName(favorite)}
                    </h3>
                    {getEntityDescription(favorite) && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {getEntityDescription(favorite)}
                      </p>
                    )}

                    {/* Category */}
                    {favorite.category && (
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{favorite.category}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {favorite.notes && (
                      <div className="flex items-start gap-2 mb-3">
                        <StickyNote className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2">{favorite.notes}</p>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-500 mb-3">
                      Added {formatDate(favorite.createdAt)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(favorite)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(favorite.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Favorite</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this item from your favorites? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Favorite Modal */}
        <AddFavoriteModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={fetchFavorites}
        />

        {/* Edit Favorite Modal */}
        <EditFavoriteModal
          isOpen={editModalOpen}
          favorite={selectedFavorite}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedFavorite(null);
          }}
          onSuccess={fetchFavorites}
        />
      </div>
    </main>
  );
}
