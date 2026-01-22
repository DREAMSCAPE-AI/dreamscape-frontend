import axios from 'axios';

// Service URL
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_API_URL || 'http://localhost:3002/api/v1';

// Create axios instance with auth interceptor
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Add auth token to requests
  instance.interceptors.request.use((config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage:', e);
      }
    }
    return config;
  });

  return instance;
};

const userApi = createApiInstance(USER_SERVICE_URL);

// Types matching backend schema
export type FavoriteType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'DESTINATION' | 'BOOKING';

export interface Favorite {
  id: string;
  userId: string;
  entityType: FavoriteType;
  entityId: string;
  entityData?: any; // Cached data for display (flight details, hotel info, etc.)
  category?: string; // User-defined category
  notes?: string; // User notes
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteCreateInput {
  entityType: FavoriteType;
  entityId: string;
  entityData?: any;
  category?: string;
  notes?: string;
}

export interface FavoriteUpdateInput {
  category?: string;
  notes?: string;
  entityData?: any;
}

export interface FavoritesListParams {
  entityType?: FavoriteType;
  limit?: number;
  offset?: number;
}

export interface FavoritesListResponse {
  favorites: Favorite[];
  total: number;
  limit: number;
  offset: number;
}

export interface CheckFavoriteResponse {
  isFavorited: boolean;
  favoriteId?: string;
}

class FavoritesService {
  /**
   * Get all user's favorites with pagination and filtering
   */
  async getFavorites(params?: FavoritesListParams): Promise<FavoritesListResponse> {
    try {
      const response = await userApi.get('/users/favorites', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Add a new favorite
   */
  async addFavorite(favoriteData: FavoriteCreateInput): Promise<Favorite> {
    try {
      const response = await userApi.post('/users/favorites', favoriteData);
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Get a specific favorite by ID
   */
  async getFavoriteById(id: string): Promise<Favorite> {
    try {
      const response = await userApi.get(`/users/favorites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite by ID:', error);
      throw error;
    }
  }

  /**
   * Update a favorite (category, notes, entityData)
   */
  async updateFavorite(id: string, updates: FavoriteUpdateInput): Promise<Favorite> {
    try {
      const response = await userApi.put(`/users/favorites/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating favorite:', error);
      throw error;
    }
  }

  /**
   * Remove a favorite
   */
  async removeFavorite(id: string): Promise<void> {
    try {
      await userApi.delete(`/users/favorites/${id}`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Check if an entity is favorited
   * Fast boolean check without retrieving full data
   */
  async checkFavorite(entityType: FavoriteType, entityId: string): Promise<CheckFavoriteResponse> {
    try {
      const response = await userApi.get(`/users/favorites/check/${entityType}/${entityId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw error;
    }
  }

  /**
   * Get favorites by type (convenience method)
   */
  async getFavoritesByType(entityType: FavoriteType, limit: number = 20): Promise<Favorite[]> {
    try {
      const response = await this.getFavorites({ entityType, limit });
      return response.favorites;
    } catch (error) {
      console.error(`Error fetching ${entityType} favorites:`, error);
      return [];
    }
  }

  /**
   * Toggle favorite (add if not favorited, remove if favorited)
   * Returns the new favorited state
   */
  async toggleFavorite(
    entityType: FavoriteType,
    entityId: string,
    entityData?: any
  ): Promise<{ isFavorited: boolean; favorite?: Favorite }> {
    try {
      // Check current state
      const checkResult = await this.checkFavorite(entityType, entityId);

      if (checkResult.isFavorited && checkResult.favoriteId) {
        // Remove favorite
        await this.removeFavorite(checkResult.favoriteId);
        return { isFavorited: false };
      } else {
        // Add favorite
        const favorite = await this.addFavorite({
          entityType,
          entityId,
          entityData,
        });
        return { isFavorited: true, favorite };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Get favorite count by type
   */
  async getFavoriteCount(entityType?: FavoriteType): Promise<number> {
    try {
      const response = await this.getFavorites({ entityType, limit: 0 });
      return response.total;
    } catch (error) {
      console.error('Error getting favorite count:', error);
      return 0;
    }
  }

  /**
   * Get all favorites count (total across all types)
   */
  async getTotalFavoriteCount(): Promise<number> {
    try {
      const response = await this.getFavorites({ limit: 0 });
      return response.total;
    } catch (error) {
      console.error('Error getting total favorite count:', error);
      return 0;
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
