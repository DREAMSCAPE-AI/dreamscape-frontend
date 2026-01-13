/**
 * User Favorites Types
 * Based on User Favorites API (DR-84)
 */

/**
 * Valid favorite types
 */
export type FavoriteType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'DESTINATION' | 'BOOKING';

/**
 * Favorite entity data (stored as JSON)
 */
export interface FavoriteEntityData {
  [key: string]: any;
}

/**
 * Individual favorite entry
 */
export interface Favorite {
  id: string;
  userId: string;
  entityType: FavoriteType;
  entityId: string;
  entityData: FavoriteEntityData;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination metadata
 */
export interface FavoritePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated favorites response
 */
export interface FavoriteResponse {
  success: boolean;
  data: {
    items: Favorite[];
    pagination: FavoritePagination;
  };
}

/**
 * Single favorite response
 */
export interface SingleFavoriteResponse {
  success: boolean;
  data: Favorite;
}

/**
 * Favorite filter parameters
 */
export interface FavoriteFilterParams {
  page?: number;
  limit?: number;
  entityType?: FavoriteType;
  category?: string;
  entityId?: string;
}

/**
 * Request body for creating a favorite
 */
export interface CreateFavoriteRequest {
  entityType: FavoriteType;
  entityId: string;
  entityData: FavoriteEntityData;
  category?: string;
  notes?: string;
}

/**
 * Request body for updating a favorite
 */
export interface UpdateFavoriteRequest {
  category?: string;
  notes?: string;
  entityData?: FavoriteEntityData;
}

/**
 * Delete favorite response
 */
export interface DeleteFavoriteResponse {
  success: boolean;
  message: string;
  data: null;
}

/**
 * Check favorite response
 */
export interface CheckFavoriteResponse {
  success: boolean;
  data: {
    isFavorited: boolean;
    favoriteId?: string;
  };
}
