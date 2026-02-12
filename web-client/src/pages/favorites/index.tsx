/**
 * Favorites Page
 * Displays all user favorites organized by category
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Plane, Building2, Compass, Calendar, Trash2, Filter } from 'lucide-react';
import FavoritesService, { Favorite, FavoriteType } from '@/services/api/FavoritesService';
import { useAuth } from '@/services/auth/AuthService';

const FavoritesPage = () => {
  const { t } = useTranslation('favorites');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FavoriteType | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const filterOptions = [
    { value: 'ALL', label: t('filters.all'), icon: Heart },
    { value: FavoriteType.FLIGHT, label: t('filters.flights'), icon: Plane },
    { value: FavoriteType.HOTEL, label: t('filters.hotels'), icon: Building2 },
    { value: FavoriteType.ACTIVITY, label: t('filters.activities'), icon: Compass },
    { value: FavoriteType.DESTINATION, label: t('filters.destinations'), icon: Calendar },
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
        setError(t('errors.loadFailed'));
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
      setError(t('errors.deleteFailed'));
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
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="p-1.5 md:p-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg flex-shrink-0">
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                {favorite.entityData?.title || favorite.entityData?.name || t('card.untitled')}
              </h3>
              <span className="text-xs text-gray-500 capitalize">{favorite.entityType.toLowerCase()}</span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(favorite.id)}
            className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
            title={t('card.removeFromFavorites')}
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Entity Data Preview */}
        <div className="text-xs md:text-sm text-gray-600 space-y-1">
          {favorite.entityType === FavoriteType.FLIGHT && favorite.entityData && (
            <>
              <p>
                <span className="font-medium">{t('card.route')}:</span> {favorite.entityData.origin} →{' '}
                {favorite.entityData.destination}
              </p>
              {favorite.entityData.price && (
                <p>
                  <span className="font-medium">{t('card.price')}:</span> {favorite.entityData.currency}{' '}
                  {favorite.entityData.price.toFixed(2)}
                </p>
              )}
            </>
          )}

          {favorite.entityType === FavoriteType.HOTEL && favorite.entityData && (
            <>
              {favorite.entityData.location && (
                <p>
                  <span className="font-medium">{t('card.location')}:</span> {favorite.entityData.location}
                </p>
              )}
              {favorite.entityData.pricePerNight && (
                <p>
                  <span className="font-medium">{t('card.price')}:</span>{' '}
                  {t('card.pricePerNight', {
                    price: `${favorite.entityData.currency} ${favorite.entityData.pricePerNight.toFixed(2)}`
                  })}
                </p>
              )}
            </>
          )}

          {favorite.entityType === FavoriteType.ACTIVITY && favorite.entityData && (
            <>
              {favorite.entityData.location && (
                <p>
                  <span className="font-medium">{t('card.location')}:</span> {favorite.entityData.location}
                </p>
              )}
              {favorite.entityData.price && (
                <p>
                  <span className="font-medium">{t('card.price')}:</span> {favorite.entityData.currency}{' '}
                  {favorite.entityData.price.toFixed(2)}
                </p>
              )}
            </>
          )}
        </div>

        {/* Category & Notes */}
        {favorite.category && (
          <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
            <span className="inline-block px-2 py-0.5 md:py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {favorite.category}
            </span>
          </div>
        )}

        {favorite.notes && (
          <p className="mt-2 text-xs md:text-sm text-gray-600 italic border-l-2 border-orange-300 pl-2 md:pl-3">{favorite.notes}</p>
        )}

        {/* Added date */}
        <div className="mt-2 md:mt-3 text-xs text-gray-400">
          {t('card.added')} {new Date(favorite.createdAt).toLocaleDateString()}
        </div>
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-6 md:py-8 px-4 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 md:gap-3">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-500 fill-pink-500" />
            {t('page.title')}
          </h1>
          <p className="text-sm md:text-base text-gray-600">{t('page.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value as any)}
                className={`
                  flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 min-h-[44px] rounded-lg font-medium text-sm md:text-base transition-colors
                  ${
                    selectedFilter === option.value
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 md:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 text-sm md:text-base text-red-700">{error}</div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12 md:py-20">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <div className="text-center py-12 md:py-20 px-4">
            <Heart className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">{t('emptyState.title')}</h3>
            <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">{t('emptyState.description')}</p>
            <button
              onClick={() => navigate('/destinations')}
              className="px-6 py-2.5 md:py-3 min-h-[44px] text-sm md:text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-colors"
            >
              {t('emptyState.exploreButton')}
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {favorites.map(renderFavoriteCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
