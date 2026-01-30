/**
 * Favorites Page
 * Displays all user favorites organized by category
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plane, Building2, Compass, Calendar, Trash2, Filter } from 'lucide-react';
import FavoritesService, { Favorite, FavoriteType } from '@/services/api/FavoritesService';
import { useAuth } from '@/services/auth/AuthService';

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FavoriteType | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const filterOptions = [
    { value: 'ALL', label: 'All Favorites', icon: Heart },
    { value: FavoriteType.FLIGHT, label: 'Flights', icon: Plane },
    { value: FavoriteType.HOTEL, label: 'Hotels', icon: Building2 },
    { value: FavoriteType.ACTIVITY, label: 'Activities', icon: Compass },
    { value: FavoriteType.DESTINATION, label: 'Destinations', icon: Calendar },
  ];

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = selectedFilter !== 'ALL' ? { entityType: selectedFilter as FavoriteType } : {};
        const response = await FavoritesService.getFavorites(params);
        setFavorites(response.data);
      } catch (err: any) {
        console.error('[FavoritesPage] Error loading favorites:', err);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user, selectedFilter, navigate]);

  // Handle delete favorite
  const handleDelete = async (id: string) => {
    try {
      await FavoritesService.deleteFavorite(id);
      setFavorites(favorites.filter((fav) => fav.id !== id));
    } catch (err) {
      console.error('[FavoritesPage] Error deleting favorite:', err);
      setError('Failed to delete favorite. Please try again.');
    }
  };

  // Render favorite card based on type
  const renderFavoriteCard = (favorite: Favorite) => {
    const Icon = filterOptions.find((opt) => opt.value === favorite.entityType)?.icon || Heart;

    return (
      <div
        key={favorite.id}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg">
              <Icon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {favorite.entityData?.title || favorite.entityData?.name || 'Untitled'}
              </h3>
              <span className="text-xs text-gray-500 capitalize">{favorite.entityType.toLowerCase()}</span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(favorite.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove from favorites"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Data Preview */}
        <div className="text-sm text-gray-600 space-y-1">
          {favorite.entityType === FavoriteType.FLIGHT && favorite.entityData && (
            <>
              <p>
                <span className="font-medium">Route:</span> {favorite.entityData.origin} →{' '}
                {favorite.entityData.destination}
              </p>
              {favorite.entityData.price && (
                <p>
                  <span className="font-medium">Price:</span> {favorite.entityData.currency}{' '}
                  {favorite.entityData.price.toFixed(2)}
                </p>
              )}
            </>
          )}

          {favorite.entityType === FavoriteType.HOTEL && favorite.entityData && (
            <>
              {favorite.entityData.location && (
                <p>
                  <span className="font-medium">Location:</span> {favorite.entityData.location}
                </p>
              )}
              {favorite.entityData.pricePerNight && (
                <p>
                  <span className="font-medium">Price:</span> {favorite.entityData.currency}{' '}
                  {favorite.entityData.pricePerNight.toFixed(2)}/night
                </p>
              )}
            </>
          )}

          {favorite.entityType === FavoriteType.ACTIVITY && favorite.entityData && (
            <>
              {favorite.entityData.location && (
                <p>
                  <span className="font-medium">Location:</span> {favorite.entityData.location}
                </p>
              )}
              {favorite.entityData.price && (
                <p>
                  <span className="font-medium">Price:</span> {favorite.entityData.currency}{' '}
                  {favorite.entityData.price.toFixed(2)}
                </p>
              )}
            </>
          )}
        </div>

        {/* Category & Notes */}
        {favorite.category && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {favorite.category}
            </span>
          </div>
        )}

        {favorite.notes && (
          <p className="mt-2 text-sm text-gray-600 italic border-l-2 border-orange-300 pl-3">{favorite.notes}</p>
        )}

        {/* Added date */}
        <div className="mt-3 text-xs text-gray-400">
          Added {new Date(favorite.createdAt).toLocaleDateString()}
        </div>
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
            My Favorites
          </h1>
          <p className="text-gray-600">Save and organize your favorite travel options</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    selectedFilter === option.value
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start adding items to your favorites to see them here</p>
            <button
              onClick={() => navigate('/destinations')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-colors"
            >
              Explore Destinations
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(renderFavoriteCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
