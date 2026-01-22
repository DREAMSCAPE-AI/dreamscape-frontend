import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plane, Building2, MapPin, Calendar, Trash2, Filter, X } from 'lucide-react';
import { useFavoritesStore } from '@/store/favoritesStore';
import { FavoriteType } from '@/services/favoritesService';
import { FavoriteButton } from '@/components/favorites';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<FavoriteType | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const favorites = useFavoritesStore((state) => state.favorites);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const getFavoritesByType = useFavoritesStore((state) => state.getFavoritesByType);
  const getCountByType = useFavoritesStore((state) => state.getCountByType);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      await fetchFavorites({ limit: 100 });
      setIsLoading(false);
    };
    loadFavorites();
  }, [fetchFavorites]);

  const filterTypes: Array<{ type: FavoriteType | 'ALL'; label: string; icon: React.ComponentType<any> }> = [
    { type: 'ALL', label: 'All', icon: Heart },
    { type: 'FLIGHT', label: 'Flights', icon: Plane },
    { type: 'HOTEL', label: 'Hotels', icon: Building2 },
    { type: 'ACTIVITY', label: 'Activities', icon: Calendar },
    { type: 'DESTINATION', label: 'Destinations', icon: MapPin },
  ];

  const displayedFavorites = selectedType === 'ALL'
    ? favorites
    : getFavoritesByType(selectedType);

  const handleRemoveFavorite = async (id: string) => {
    if (confirm('Are you sure you want to remove this favorite?')) {
      await removeFavorite(id);
    }
  };

  const renderFavoriteCard = (favorite: any) => {
    const data = favorite.entityData || favorite.data || {};

    return (
      <div
        key={favorite.id}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          {data.image && (
            <div className="sm:w-64 h-48 sm:h-auto relative overflow-hidden">
              <img
                src={data.image}
                alt={data.name || 'Favorite item'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <FavoriteButton
                  entityType={favorite.entityType}
                  entityId={favorite.entityId}
                  entityData={data}
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {favorite.entityData.name || favorite.entityId ? `${favorite.entityData.name} ` : `${favorite.entityType} Favorite`}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  {favorite.entityType === 'HOTEL' && data.rating && (
                    <span className="flex items-center gap-1">
                      <span className="text-orange-500">★</span>
                      {data.rating} Star{parseInt(data.rating) > 1 ? 's' : ''}
                    </span>
                  )}
                  {data.chainCode && (
                    <span>• {data.chainCode}</span>
                  )}
                </div>

                {favorite.category && (
                  <div className="inline-block px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full mb-2">
                    {favorite.category}
                  </div>
                )}

                {favorite.notes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {favorite.notes}
                  </p>
                )}
              </div>

              {/* Price */}
              {data.price && (
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${data.price}
                  </div>
                  {data.currency && (
                    <div className="text-xs text-gray-500">{data.currency}</div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  // Navigate to detail page based on type
                  // This would need to be implemented based on your routing
                  console.log('View details:', favorite);
                }}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                View Details
              </button>

              <button
                onClick={() => handleRemoveFavorite(favorite.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove favorite"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Added {favorite.createdAt ? new Date(favorite.createdAt).toLocaleDateString() : 'Unknown date'}</span>
              {favorite.updatedAt && favorite.updatedAt !== favorite.createdAt && (
                <span>• Updated {new Date(favorite.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            Your saved flights, hotels, activities, and destinations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {filterTypes.map(({ type, label, icon: Icon }) => {
              const count = type === 'ALL' ? favorites.length : getCountByType(type);
              const isActive = selectedType === type;

              return (
                <button
                  key={`${type}-${count}`}
                  onClick={() => setSelectedType(type)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
                    ${isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {count > 0 && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-white/20' : 'bg-orange-500 text-white'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your favorites...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayedFavorites.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedType === 'ALL' ? 'No favorites yet' : `No ${filterTypes.find(f => f.type === selectedType)?.label.toLowerCase()} saved`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding favorites by clicking the heart icon on flights, hotels, and activities
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Explore Travel Options
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && displayedFavorites.length > 0 && (
          <div className="space-y-4">
            {displayedFavorites.map(renderFavoriteCard)}
          </div>
        )}

        {/* Summary */}
        {!isLoading && displayedFavorites.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {displayedFavorites.length} of {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
