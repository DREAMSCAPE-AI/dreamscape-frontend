import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  HistoryResponse,
  HistoryStatsResponse,
  HistoryFilterParams,
  CreateHistoryEntry,
  DeleteHistoryResponse,
  ClearHistoryResponse,
  HistoryEntityType,
} from '@/types/history';

const HISTORY_API_BASE_URL = import.meta.env.USER_SERVICE_API_URL || 'http://localhost:3002/api/v1';

/**
 * Service for managing user history
 * Based on User History API (DR-83)
 */
class HistoryService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${HISTORY_API_BASE_URL}/users/history`,
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
        console.error('History API Error:', error.response?.data || error.message);

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
   * Get paginated user history with optional filters
   * @param params - Filter and pagination parameters
   * @returns Promise with history response
   */
  async getHistory(params?: HistoryFilterParams): Promise<HistoryResponse> {
    try {
      const response = await this.api.get<HistoryResponse>('', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch user history');
      }
      throw error;
    }
  }

  /**
   * Get aggregated history statistics
   * @returns Promise with statistics response
   */
  async getStats(): Promise<HistoryStatsResponse> {
    try {
      const response = await this.api.get<HistoryStatsResponse>('/stats');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch history statistics');
      }
      throw error;
    }
  }

  /**
   * Create a new history entry to track a user action
   * @param entry - History entry data
   * @returns Promise with created entry
   */
  async trackAction(entry: CreateHistoryEntry): Promise<any> {
    try {
      const response = await this.api.post('', entry);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to create history entry');
      }
      throw error;
    }
  }

  /**
   * Delete a specific history entry by ID
   * @param id - History entry ID
   * @returns Promise with delete confirmation
   */
  async deleteEntry(id: string): Promise<DeleteHistoryResponse> {
    try {
      const response = await this.api.delete<DeleteHistoryResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to delete history entry';
        if (error.response?.status === 404) {
          throw new Error('History entry not found');
        }
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Clear all or filtered history entries for the authenticated user
   * @param entityType - Optional entity type filter
   * @returns Promise with deletion count
   */
  async clearHistory(entityType?: HistoryEntityType): Promise<ClearHistoryResponse> {
    try {
      const params = entityType ? { entityType } : undefined;
      const response = await this.api.delete<ClearHistoryResponse>('', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to clear user history');
      }
      throw error;
    }
  }
}

export const historyService = new HistoryService();
export default historyService;
