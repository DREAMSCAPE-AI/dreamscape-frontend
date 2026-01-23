/**
 * Favorite Button Component
 * Reusable button to add/remove items from favorites
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import FavoritesService, { FavoriteType } from '@/services/api/FavoritesService';
import { useAuth } from '@/services/auth/AuthService';
import { useFavoritesBatch } from '@/contexts/FavoritesBatchContext';

interface FavoriteButtonProps {
  entityType: FavoriteType;
  entityId: string;
  entityData?: any;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const FavoriteButton = ({
  entityType,
  entityId,
  entityData,
  className = '',
  size = 'md',
  showLabel = false,
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { checkFavorite } = useFavoritesBatch();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Check if item is already favorited using batch context
  useEffect(() => {
    if (!user) return;

    // Use batch context for efficient checking
    checkFavorite(entityType, entityId, (result) => {
      setIsFavorited(result.isFavorited);
      if (result.favorite) {
        setFavoriteId(result.favorite.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, user]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // TODO: Show login modal or redirect to login
      console.warn('[FavoriteButton] User must be logged in to add favorites');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited && favoriteId) {
        // Remove from favorites
        await FavoritesService.deleteFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
        console.log('[FavoriteButton] Removed from favorites');
      } else {
        // Add to favorites
        const response = await FavoritesService.addFavorite({
          entityType,
          entityId,
          entityData,
        });
        setIsFavorited(true);
        setFavoriteId(response.data.id);
        console.log('[FavoriteButton] Added to favorites');
      }
    } catch (error: any) {
      console.error('[FavoriteButton] Error toggling favorite:', error);

      // Handle specific error cases
      if (error.response?.status === 409) {
        console.log('[FavoriteButton] Item already in favorites');
        setIsFavorited(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show button if user is not logged in
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${className}
        flex items-center justify-center gap-2
        rounded-full
        transition-all duration-200
        ${
          isFavorited
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        shadow-md hover:shadow-lg
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={iconSizes[size]}
        className={`${isFavorited ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`}
      />
      {showLabel && (
        <span className="font-medium">
          {isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
