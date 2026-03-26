import axios, { AxiosInstance } from 'axios';

const resolveBaseUrl = (envValue?: string, fallbackPath = '/api') => {
  const trimmed = (envValue || '').trim();
  if (trimmed) return trimmed;
  return fallbackPath;
};

const USER_SERVICE_URL = resolveBaseUrl(import.meta.env.VITE_USER_SERVICE_API_URL || import.meta.env.VITE_USER_SERVICE_URL);
const VOYAGE_SERVICE_URL = resolveBaseUrl(import.meta.env.VITE_VOYAGE_SERVICE_URL);
const AI_SERVICE_URL = resolveBaseUrl(import.meta.env.VITE_AI_SERVICE_URL);
const API_BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL);

// Read from Zustand auth store persisted in localStorage
const getAuthState = (): { token: string | null; userId: string | null } => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return { token: null, userId: null };
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    return {
      token: state?.token || null,
      userId: state?.user?.id || null
    };
  } catch {
    return { token: null, userId: null };
  }
};

const getAuthToken = (): string | null => getAuthState().token;
const getAuthUserId = (): string | null => getAuthState().userId;

// Create axios instances per service with auth interceptor
const createApi = (baseURL: string): AxiosInstance => {
  const instance = axios.create({ baseURL, timeout: 10000 });
  instance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
};

const userApi = createApi(USER_SERVICE_URL);
const voyageApi = createApi(VOYAGE_SERVICE_URL);
const aiApi = createApi(AI_SERVICE_URL);
const api = createApi(API_BASE_URL);

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  bookingHistory: Booking[];
  searchHistory: SearchHistory[];
  preferences: UserPreferences;
  stats: UserStats;
}

export interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'transfer' | 'activity';
  status: 'confirmed' | 'pending' | 'cancelled';
  destination: string;
  departureDate: string;
  returnDate?: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  details: any;
}

export interface SearchHistory {
  id: string;
  query: string;
  type: 'flight' | 'hotel' | 'activity' | 'destination';
  searchDate: string;
  results: number;
  clicked: boolean;
}

export interface UserPreferences {
  preferredCurrency: string;
  preferredLanguage: string;
  travelClass: 'economy' | 'business' | 'first';
  seatPreference: 'window' | 'aisle' | 'middle';
  mealPreference: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  destinations: string[];
  travelStyle: 'luxury' | 'budget' | 'mid-range';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface UserStats {
  totalBookings: number;
  totalSpent: number;
  countriesVisited: number;
  favoriteDestination: string;
  averageTripDuration: number;
  upcomingTrips: number;
}

export interface TravelRecommendation {
  id: string;
  type: 'destination' | 'activity' | 'hotel' | 'flight';
  title: string;
  description: string;
  location: string;
  price: number;
  currency: string;
  rating: number;
  image: string;
  tags: string[];
  validUntil: string;
  confidence: number;
}

export interface FlightInsight {
  destination: string;
  averagePrice: number;
  priceChange: number;
  bestTimeToBook: string;
  popularMonths: string[];
  tips: string[];
}

// Transform voyage-service booking format to frontend Booking interface
const mapBooking = (raw: any): Booking => {
  const item = raw.items?.[0]?.itemData || {};
  const type = (raw.type || '').toLowerCase() as Booking['type'];
  const statusMap: Record<string, Booking['status']> = {
    CONFIRMED: 'confirmed',
    PENDING: 'pending',
    PENDING_PAYMENT: 'pending',
    CANCELLED: 'cancelled',
    DRAFT: 'pending',
    COMPLETED: 'confirmed',
    FAILED: 'cancelled'
  };

  // Extract destination/location from item data
  const destination = item.location || item.cityCode || item.name || '';

  // Extract dates based on booking type
  let departureDate = raw.createdAt;
  let returnDate: string | undefined;
  if (type === 'hotel') {
    departureDate = item.checkInDate || raw.createdAt;
    returnDate = item.checkOutDate;
  } else if (type === 'flight') {
    const seg = item.itineraries?.[0]?.segments?.[0];
    departureDate = seg?.departure?.at || raw.createdAt;
    returnDate = seg?.arrival?.at;
  }

  return {
    id: raw.id,
    type: type || 'activity',
    status: statusMap[raw.status] || 'pending',
    destination,
    departureDate,
    returnDate,
    totalAmount: raw.totalAmount || 0,
    currency: raw.currency || 'EUR',
    createdAt: raw.createdAt,
    details: item
  };
};

class DashboardService {
  // User Profile Management → user-service
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await userApi.get('/v1/users/profile');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await userApi.put('/v1/users/profile', updates);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Booking Management → voyage-service
  async getUserBookings(): Promise<Booking[]> {
    try {
      const userId = getAuthUserId();
      const response = await voyageApi.get('/v1/bookings', {
        params: { userId, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }
      });
      const data = response.data?.data || response.data;
      const rawBookings = Array.isArray(data) ? data : data?.bookings || [];
      return rawBookings.map(mapBooking);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async getUpcomingTrips(): Promise<Booking[]> {
    try {
      const userId = getAuthUserId();
      const response = await voyageApi.get('/v1/bookings', {
        params: { userId, status: 'CONFIRMED', sortBy: 'createdAt', sortOrder: 'asc' }
      });
      const data = response.data?.data || response.data;
      const rawBookings = Array.isArray(data) ? data : data?.bookings || [];
      const bookings: Booking[] = rawBookings.map(mapBooking);
      // Filter for future trips
      const now = new Date();
      return bookings.filter((b: Booking) => {
        const dep = b.departureDate || b.createdAt;
        return dep && new Date(dep) >= now;
      });
    } catch (error) {
      console.error('Error fetching upcoming trips:', error);
      return [];
    }
  }

  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await voyageApi.post(`/v1/bookings/${bookingId}/cancel`);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Booking Stats → voyage-service
  async getTravelStats(): Promise<UserStats> {
    try {
      const userId = getAuthUserId();
      const response = await voyageApi.get('/v1/bookings/stats', {
        params: { userId }
      });
      const data = response.data?.data || response.data;
      const byStatus = data.byStatus || {};
      return {
        totalBookings: data.total || data.totalBookings || 0,
        totalSpent: data.totalSpent || data.totalAmount || 0,
        countriesVisited: data.countriesVisited || 0,
        favoriteDestination: data.favoriteDestination || '',
        averageTripDuration: data.averageTripDuration || 0,
        upcomingTrips: data.upcomingTrips || byStatus.CONFIRMED || 0
      };
    } catch (error) {
      console.error('Error fetching travel stats:', error);
      throw error;
    }
  }

  // Search History → user-service
  async getSearchHistory(): Promise<SearchHistory[]> {
    try {
      const response = await userApi.get('/v1/users/history', {
        params: { actionType: 'SEARCH', limit: 20 }
      });
      const data = response.data?.data || response.data;
      const items = Array.isArray(data) ? data : data?.history || [];
      return items.map((item: any) => ({
        id: item.id,
        query: item.details?.query || item.entityId || '',
        type: item.entityType?.toLowerCase() || 'destination',
        searchDate: item.createdAt || item.timestamp,
        results: item.details?.resultsCount || 0,
        clicked: item.details?.clicked || false
      }));
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }

  async getRecentSearches(limit: number = 5): Promise<string[]> {
    try {
      const response = await userApi.get('/v1/users/history', {
        params: { actionType: 'SEARCH', limit }
      });
      const data = response.data?.data || response.data;
      const items = Array.isArray(data) ? data : data?.history || [];
      return items
        .map((item: any) => item.details?.query || item.entityId || '')
        .filter(Boolean);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }
  }

  // Recommendations → ai-service
  async getPersonalizedRecommendations(): Promise<TravelRecommendation[]> {
    try {
      const response = await aiApi.get('/v1/recommendations/personalized');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data?.recommendations || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  async getTrendingDestinations(): Promise<TravelRecommendation[]> {
    try {
      const response = await aiApi.get('/v1/recommendations/trending');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data?.destinations || [];
    } catch (error) {
      console.error('Error fetching trending destinations:', error);
      return [];
    }
  }

  async getDealsAndOffers(): Promise<TravelRecommendation[]> {
    try {
      const response = await aiApi.get('/v1/recommendations/deals');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data?.deals || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  }

  // Flight Insights → ai-service
  async getFlightInsights(origin?: string): Promise<FlightInsight[]> {
    try {
      const params = origin ? { origin } : {};
      const response = await aiApi.get('/v1/recommendations/flights', { params });
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching flight insights:', error);
      return [];
    }
  }

  async getPriceAlerts(): Promise<any[]> {
    try {
      const response = await api.get('/price-alerts');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      return [];
    }
  }

  async createPriceAlert(alertData: any): Promise<any> {
    try {
      const response = await api.post('/price-alerts', alertData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating price alert:', error);
      throw error;
    }
  }

  async getDestinationInsights(destination: string): Promise<any> {
    try {
      const response = await aiApi.get(`/v1/recommendations/similar/${destination}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching destination insights:', error);
      throw error;
    }
  }

  // User Favorites → user-service
  async getUserFavorites(): Promise<any[]> {
    try {
      const response = await userApi.get('/v1/users/favorites');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data?.favorites || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  // User Itineraries → voyage-service
  async getUserItineraries(): Promise<any[]> {
    try {
      const response = await voyageApi.get('/v1/itineraries');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data?.itineraries || [];
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      return [];
    }
  }

  // Preferences → user-service
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await userApi.put('/v1/users/profile', { preferences });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Quick Actions → voyage-service
  async quickFlightSearch(params: any): Promise<any[]> {
    try {
      const response = await voyageApi.get('/v1/flights/search', { params });
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in quick flight search:', error);
      return [];
    }
  }

  async quickHotelSearch(params: any): Promise<any[]> {
    try {
      const response = await voyageApi.get('/v1/hotels/search', { params });
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in quick hotel search:', error);
      return [];
    }
  }

  async quickActivitySearch(params: any): Promise<any[]> {
    try {
      const response = await voyageApi.get('/v1/activities/search', { params });
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in quick activity search:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
