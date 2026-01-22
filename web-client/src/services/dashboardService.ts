import axios from 'axios';

// Service URLs
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001/api';
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_API_URL || 'http://localhost:3002/api/v1';
const VOYAGE_SERVICE_URL = import.meta.env.VITE_VOYAGE_SERVICE_URL || 'http://localhost:3004/api/v1';

// Create axios instances for different services
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

const authApi = createApiInstance(AUTH_SERVICE_URL);
const userApi = createApiInstance(USER_SERVICE_URL);
const voyageApi = createApiInstance(VOYAGE_SERVICE_URL);

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

class DashboardService {
  // User Profile Management
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await userApi.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await userApi.put('/users/profile', updates);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Booking Management
  async getUserBookings(): Promise<Booking[]> {
    try {
      const response = await voyageApi.get('/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async getUpcomingTrips(): Promise<Booking[]> {
    try {
      const response = await voyageApi.get('/bookings/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming trips:', error);
      return [];
    }
  }

  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await voyageApi.delete(`/bookings/${bookingId}`);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Search History
  async getSearchHistory(): Promise<SearchHistory[]> {
    try {
      const response = await userApi.get('/users/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }

  async getRecentSearches(limit: number = 5): Promise<string[]> {
    try {
      const response = await userApi.get(`/users/history/recent?limit=${limit}`);
      return response.data.map((item: SearchHistory) => item.query);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }
  }

  // Recommendations
  async getPersonalizedRecommendations(): Promise<TravelRecommendation[]> {
    try {
      const response = await voyageApi.get('/recommendations/personalized');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  async getTrendingDestinations(): Promise<TravelRecommendation[]> {
    try {
      const response = await voyageApi.get('/recommendations/trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending destinations:', error);
      return [];
    }
  }

  async getDealsAndOffers(): Promise<TravelRecommendation[]> {
    try {
      const response = await voyageApi.get('/recommendations/deals');
      return response.data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  }

  // Flight Insights
  async getFlightInsights(origin?: string): Promise<FlightInsight[]> {
    try {
      const params = origin ? { origin } : {};
      const response = await voyageApi.get('/flights/insights', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching flight insights:', error);
      return [];
    }
  }

  async getPriceAlerts(): Promise<any[]> {
    try {
      const response = await voyageApi.get('/price-alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      return [];
    }
  }

  async createPriceAlert(alertData: any): Promise<any> {
    try {
      const response = await voyageApi.post('/price-alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Error creating price alert:', error);
      throw error;
    }
  }

  // Analytics and Insights
  async getTravelStats(): Promise<UserStats> {
    try {
      const response = await userApi.get('/users/analytics/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching travel stats:', error);
      throw error;
    }
  }

  async getDestinationInsights(destination: string): Promise<any> {
    try {
      const response = await voyageApi.get(`/analytics/destination/${destination}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching destination insights:', error);
      throw error;
    }
  }

  // Preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await userApi.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Quick Actions
  async quickFlightSearch(params: any): Promise<any[]> {
    try {
      const response = await voyageApi.get('/flights/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error in quick flight search:', error);
      return [];
    }
  }

  async quickHotelSearch(params: any): Promise<any[]> {
    try {
      const response = await voyageApi.get('/hotels/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error in quick hotel search:', error);
      return [];
    }
  }

  async quickActivitySearch(params: any): Promise<any[]> {
    try {
      const response = await voyageApi.get('/activities/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error in quick activity search:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
