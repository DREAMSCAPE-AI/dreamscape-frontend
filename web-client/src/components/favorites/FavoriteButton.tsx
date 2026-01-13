import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { favoritesService } from '@/services/favoritesService';
import type { FavoriteType, FavoriteEntityData } from '@/types/favorites';

interface FavoriteButtonProps {
  entityType: FavoriteType;
  entityId: string;
  entityData: FavoriteEntityData;
  onToggle?: (isFavorited: boolean, favoriteId?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function FavoriteButton({
  entityType,
  entityId,
  entityData,
  onToggle,
  className = '',
  size = 'md',
  showText = false,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Size mappings
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

  // Check if entity is already favorited on mount
  useEffect(() => {
    checkFavoriteStatus();
  }, [entityType, entityId]);

  const checkFavoriteStatus = async () => {
    try {
      setIsChecking(true);
      const response = await favoritesService.checkFavorite(entityType, entityId);
      setIsFavorited(response.data.isFavorited);
      setFavoriteId(response.data.favoriteId);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      setIsLoading(true);

      if (isFavorited && favoriteId) {
        // Remove from favorites
        await favoritesService.deleteFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(undefined);
        onToggle?.(false);
      } else {
        // Add to favorites
        const response = await favoritesService.addFavorite({
          entityType,
          entityId,
          entityData,
        });
        setIsFavorited(true);
        setFavoriteId(response.data.id);
        onToggle?.(true, response.data.id);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert optimistic update on error
      await checkFavoriteStatus();
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button
        className={`${buttonSizeClasses[size]} rounded-full bg-gray-100 transition-colors ${className}`}
        disabled
      >
        <Heart className={`${sizeClasses[size]} text-gray-400 animate-pulse`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]}
        rounded-full
        transition-all
        duration-200
        ${isFavorited
          ? 'bg-pink-100 hover:bg-pink-200 text-pink-600'
          : 'bg-white hover:bg-gray-100 text-gray-400 hover:text-pink-600'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <div className="flex items-center gap-2">
        <Heart
          className={`
            ${sizeClasses[size]}
            transition-all
            duration-200
            ${isFavorited ? 'fill-current' : ''}
            ${isLoading ? 'animate-pulse' : ''}
          `}
        />
        {showText && (
          <span className="text-sm font-medium">
            {isFavorited ? 'Favorited' : 'Favorite'}
          </span>
        )}
      </div>
    </button>
  );
}
