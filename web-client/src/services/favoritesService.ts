import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  FavoriteResponse,
  SingleFavoriteResponse,
  FavoriteFilterParams,
  CreateFavoriteRequest,
  UpdateFavoriteRequest,
  DeleteFavoriteResponse,
  CheckFavoriteResponse,
  FavoriteType,
} from '@/types/favorites';

const FAVORITES_API_BASE_URL = import.meta.env.USER_SERVICE_API_URL || 'http://localhost:3002/api/v1';

/**
 * Service for managing user favorites
 * Based on User Favorites API (DR-84)
 */
class FavoritesService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${FAVORITES_API_BASE_URL}/users/favorites`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Get token from Zustand auth storage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const authData = JSON.parse(authStorage);
            const token = authData?.state?.token;
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to parse auth storage:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('Favorites API Error:', error.response?.data || error.message);

        // Handle unauthorized errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth-storage');
          window.location.href = '/auth';
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get paginated user favorites with optional filters
   * @param params - Filter and pagination parameters
   * @returns Promise with favorites response
   */
  async getFavorites(params?: FavoriteFilterParams): Promise<FavoriteResponse> {
    try {
      const response = await this.api.get<FavoriteResponse>('', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch user favorites');
      }
      throw error;
    }
  }

  /**
   * Get a specific favorite by ID
   * @param id - Favorite ID
   * @returns Promise with favorite response
   */
  async getFavorite(id: string): Promise<SingleFavoriteResponse> {
    try {
      const response = await this.api.get<SingleFavoriteResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Favorite not found');
        }
        throw new Error(error.response?.data?.error || 'Failed to fetch favorite');
      }
      throw error;
    }
  }

  /**
   * Add a new favorite
   * @param data - Favorite data
   * @returns Promise with created favorite
   */
  async addFavorite(data: CreateFavoriteRequest): Promise<SingleFavoriteResponse> {
    try {
      const response = await this.api.post<SingleFavoriteResponse>('', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('This item is already in your favorites');
        }
        throw new Error(error.response?.data?.error || 'Failed to add favorite');
      }
      throw error;
    }
  }

  /**
   * Update a favorite (notes or category)
   * @param id - Favorite ID
   * @param data - Update data
   * @returns Promise with updated favorite
   */
  async updateFavorite(id: string, data: UpdateFavoriteRequest): Promise<SingleFavoriteResponse> {
    try {
      const response = await this.api.put<SingleFavoriteResponse>(`/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Favorite not found');
        }
        throw new Error(error.response?.data?.error || 'Failed to update favorite');
      }
      throw error;
    }
  }

  /**
   * Delete a favorite by ID
   * @param id - Favorite ID
   * @returns Promise with delete confirmation
   */
  async deleteFavorite(id: string): Promise<DeleteFavoriteResponse> {
    try {
      const response = await this.api.delete<DeleteFavoriteResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Favorite not found');
        }
        throw new Error(error.response?.data?.error || 'Failed to delete favorite');
      }
      throw error;
    }
  }

  /**
   * Check if an entity is favorited
   * @param entityType - Type of entity
   * @param entityId - Entity ID
   * @returns Promise with check result
   */
  async checkFavorite(entityType: FavoriteType, entityId: string): Promise<CheckFavoriteResponse> {
    try {
      const response = await this.api.get<CheckFavoriteResponse>(`/check/${entityType}/${entityId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to check favorite status');
      }
      throw error;
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
