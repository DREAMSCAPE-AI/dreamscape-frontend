/**
 * Favorites Service - Handles all API calls related to user favorites
 */

import axios, { AxiosInstance } from 'axios';

const USER_API_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002/api/v1';

export enum FavoriteType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  ACTIVITY = 'ACTIVITY',
  DESTINATION = 'DESTINATION',
  BOOKING = 'BOOKING',
}

export interface Favorite {
  id: string;
  userId: string;
  entityType: FavoriteType;
  entityId: string;
  entityData?: any;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddFavoriteRequest {
  entityType: FavoriteType;
  entityId: string;
  entityData?: any;
  category?: string;
  notes?: string;
}

export interface UpdateFavoriteRequest {
  category?: string;
  notes?: string;
  entityData?: any;
}

export interface GetFavoritesParams {
  limit?: number;
  offset?: number;
  entityType?: FavoriteType;
}

export interface GetFavoritesResponse {
  success: boolean;
  data: Favorite[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class FavoritesService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${USER_API_BASE_URL}/users/favorites`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('dreamscape_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get all favorites for the authenticated user
   */
  async getFavorites(params?: GetFavoritesParams): Promise<GetFavoritesResponse> {
    const response = await this.api.get('/', { params });
    return response.data;
  }

  /**
   * Add a new favorite
   */
  async addFavorite(data: AddFavoriteRequest): Promise<{ success: boolean; data: Favorite; message: string }> {
    const response = await this.api.post('/', data);
    return response.data;
  }

  /**
   * Get a specific favorite by ID
   */
  async getFavoriteById(id: string): Promise<{ success: boolean; data: Favorite }> {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  /**
   * Update a favorite
   */
  async updateFavorite(
    id: string,
    data: UpdateFavoriteRequest
  ): Promise<{ success: boolean; data: Favorite; message: string }> {
    const response = await this.api.put(`/${id}`, data);
    return response.data;
  }

  /**
   * Delete a favorite
   */
  async deleteFavorite(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  /**
   * Check if an entity is favorited
   */
  async checkFavorite(
    entityType: FavoriteType,
    entityId: string
  ): Promise<{ success: boolean; isFavorited: boolean; favorite: { id: string; createdAt: string } | null }> {
    const response = await this.api.get(`/check/${entityType}/${entityId}`);
    return response.data;
  }
}

export default new FavoritesService();
