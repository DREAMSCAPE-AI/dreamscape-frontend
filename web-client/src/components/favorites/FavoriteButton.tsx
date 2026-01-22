import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { FavoriteType } from '../../services/favoritesService';
import { useFavoritesStore } from '../../store/favoritesStore';

interface FavoriteButtonProps {
  entityType: FavoriteType;
  entityId: string;
  entityData?: any;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  onError?: (error: Error) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  entityType,
  entityId,
  entityData,
  size = 'md',
  className = '',
  showLabel = false,
  onToggle,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get state and actions from Zustand store
  const isFavorited = useFavoritesStore((state) => state.isFavorited(entityType, entityId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const storeLoading = useFavoritesStore((state) => state.isLoading);

  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || storeLoading) return;

    setIsLoading(true);
    try {
      const newFavoritedState = await toggleFavorite(
        entityType,
        entityId,
        entityData
      );

      // Call onToggle callback if provided
      if (onToggle) {
        onToggle(newFavoritedState);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);

      // Call onError callback if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || storeLoading;

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`
        group relative inline-flex items-center gap-2
        ${buttonSizeClasses[size]}
        rounded-lg
        transition-all duration-200
        ${isFavorited
          ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
          : 'text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {/* Heart Icon */}
      <Heart
        className={`
          ${sizeClasses[size]}
          transition-all duration-200
          ${isFavorited ? 'fill-current' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />

      {/* Optional Label */}
      {showLabel && (
        <span className="text-xs font-medium">
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
};

export default FavoriteButton;
