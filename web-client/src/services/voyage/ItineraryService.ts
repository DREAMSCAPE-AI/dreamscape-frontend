import axios, { AxiosInstance } from 'axios';
import type {
  Itinerary,
  ItineraryItem,
  ItineraryItemType,
  CreateItineraryDto,
  UpdateItineraryDto,
  CreateItineraryItemDto,
  UpdateItineraryItemDto,
  ReorderItemsDto,
  ExportFormat
} from '@/types/itinerary';

// Re-export types for convenience
export type {
  Itinerary,
  ItineraryItem,
  ItineraryItemType,
  CreateItineraryDto,
  UpdateItineraryDto,
  CreateItineraryItemDto,
  UpdateItineraryItemDto,
  ReorderItemsDto,
  ExportFormat
};

/**
 * Service for managing itineraries
 */
class ItineraryService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_VOYAGE_SERVICE_URL;

    this.api = axios.create({
      baseURL: `${this.baseURL}/v1`,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true // For cookie-based auth
    });

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Get token from Zustand auth store (persisted in localStorage)
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

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login or refresh token
          console.error('Unauthorized access - please login');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all itineraries for the authenticated user
   */
  async getItineraries(): Promise<Itinerary[]> {
    const { data } = await this.api.get<Itinerary[]>('/itineraries');
    return data;
  }

  /**
   * Get a single itinerary by ID with all items
   */
  async getItineraryById(id: string): Promise<Itinerary> {
    const { data } = await this.api.get<Itinerary>(`/itineraries/${id}`);
    return data;
  }

  /**
   * Create a new itinerary
   */
  async createItinerary(dto: CreateItineraryDto): Promise<Itinerary> {
    const { data } = await this.api.post<Itinerary>('/itineraries', dto);
    return data;
  }

  /**
   * Update an existing itinerary
   */
  async updateItinerary(id: string, dto: UpdateItineraryDto): Promise<Itinerary> {
    const { data } = await this.api.put<Itinerary>(`/itineraries/${id}`, dto);
    return data;
  }

  /**
   * Delete an itinerary
   */
  async deleteItinerary(id: string): Promise<void> {
    await this.api.delete(`/itineraries/${id}`);
  }

  /**
   * Add an item to an itinerary
   */
  async addItem(itineraryId: string, dto: CreateItineraryItemDto): Promise<ItineraryItem> {
    const { data } = await this.api.post<ItineraryItem>(
      `/itineraries/${itineraryId}/items`,
      dto
    );
    return data;
  }

  /**
   * Update an itinerary item
   */
  async updateItem(
    itineraryId: string,
    itemId: string,
    dto: UpdateItineraryItemDto
  ): Promise<ItineraryItem> {
    const { data } = await this.api.put<ItineraryItem>(
      `/itineraries/${itineraryId}/items/${itemId}`,
      dto
    );
    return data;
  }

  /**
   * Delete an itinerary item
   */
  async deleteItem(itineraryId: string, itemId: string): Promise<void> {
    await this.api.delete(`/itineraries/${itineraryId}/items/${itemId}`);
  }

  /**
   * Reorder items (for drag-n-drop)
   */
  async reorderItems(itineraryId: string, dto: ReorderItemsDto): Promise<void> {
    await this.api.patch(`/itineraries/${itineraryId}/items/reorder`, dto);
  }

  /**
   * Export itinerary
   * @param id - Itinerary ID
   * @param format - Export format (pdf, ical, email)
   * @returns For PDF/iCal: Blob for download, for email: success message
   */
  async exportItinerary(
    id: string,
    format: ExportFormat
  ): Promise<{ data?: Blob; message?: string }> {
    if (format === 'pdf' || format === 'ical') {
      // Download file
      const response = await this.api.get(`/itineraries/${id}/export`, {
        params: { format },
        responseType: 'blob'
      });

      return { data: response.data };
    } else if (format === 'email') {
      // Send email
      const { data } = await this.api.get<{ message: string }>(
        `/itineraries/${id}/export`,
        { params: { format } }
      );
      return { message: data.message };
    }

    throw new Error('Invalid export format');
  }

  /**
   * Download exported file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const itineraryService = new ItineraryService();
export default itineraryService;
