import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../services/auth/AuthService';
import dashboardService, {
  UserProfile,
  Booking,
  SearchHistory,
  TravelRecommendation,
  FlightInsight,
  UserStats
} from '../services/dashboardService';

interface DashboardData {
  profile: UserProfile | null;
  upcomingTrips: Booking[];
  recentBookings: Booking[];
  searchHistory: SearchHistory[];
  recentSearches: string[];
  recommendations: TravelRecommendation[];
  trendingDestinations: TravelRecommendation[];
  deals: TravelRecommendation[];
  flightInsights: FlightInsight[];
  priceAlerts: any[];
  stats: UserStats | null;
}

interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<DashboardState>({
    profile: null,
    upcomingTrips: [],
    recentBookings: [],
    searchHistory: [],
    recentSearches: [],
    recommendations: [],
    trendingDestinations: [],
    deals: [],
    flightInsights: [],
    priceAlerts: [],
    stats: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const updateData = (updates: Partial<DashboardData>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const profile = await dashboardService.getUserProfile();
      updateData({ profile });
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Use fallback data from auth service
      if (user) {
        updateData({
          profile: {
            id: user.id,
            name: user.name,
            email: user.email,
            bookingHistory: [],
            searchHistory: [],
            preferences: {
              preferredCurrency: 'USD',
              preferredLanguage: 'en',
              travelClass: 'economy',
              seatPreference: 'window',
              mealPreference: [],
              budgetRange: { min: 0, max: 5000 },
              destinations: [],
              travelStyle: 'mid-range',
              notifications: { email: true, sms: false, push: true }
            },
            stats: {
              totalBookings: 0,
              totalSpent: 0,
              countriesVisited: 0,
              favoriteDestination: '',
              averageTripDuration: 0,
              upcomingTrips: 0
            }
          }
        });
      }
    }
  }, [isAuthenticated, user]);

  // Load bookings
  const loadBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const [upcomingTrips, recentBookings] = await Promise.all([
        dashboardService.getUpcomingTrips(),
        dashboardService.getUserBookings()
      ]);
      updateData({ upcomingTrips, recentBookings: recentBookings.slice(0, 5) });
    } catch (error) {
      console.error('Failed to load bookings:', error);
      // Use mock data
      updateData({
        upcomingTrips: [
          {
            id: '1',
            type: 'flight',
            status: 'confirmed',
            destination: 'Paris, France',
            departureDate: '2024-03-15',
            returnDate: '2024-03-22',
            totalAmount: 1200,
            currency: 'USD',
            createdAt: '2024-02-15',
            details: { airline: 'Air France', flightNumber: 'AF123' }
          }
        ],
        recentBookings: []
      });
    }
  }, [isAuthenticated]);

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const [searchHistory, recentSearches] = await Promise.all([
        dashboardService.getSearchHistory(),
        dashboardService.getRecentSearches(5)
      ]);
      updateData({ searchHistory, recentSearches });
    } catch (error) {
      console.error('Failed to load search history:', error);
      // Use mock data
      updateData({
        searchHistory: [],
        recentSearches: [
          "Beach resorts in Bali",
          "Cultural tours in Kyoto", 
          "Mountain retreats in Switzerland"
        ]
      });
    }
  }, [isAuthenticated]);

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const [recommendations, trendingDestinations, deals] = await Promise.all([
        dashboardService.getPersonalizedRecommendations(),
        dashboardService.getTrendingDestinations(),
        dashboardService.getDealsAndOffers()
      ]);
      updateData({ recommendations, trendingDestinations, deals });
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      // Use mock data
      updateData({
        recommendations: [
          {
            id: '1',
            type: 'activity',
            title: 'Tokyo Night Tour',
            description: 'Explore Tokyo\'s vibrant nightlife',
            location: 'Tokyo, Japan',
            price: 100,
            currency: 'USD',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80',
            tags: ['cultural', 'nightlife'],
            validUntil: '2024-12-31',
            confidence: 0.9
          },
          {
            id: '2',
            type: 'activity',
            title: 'Desert Safari',
            description: 'Adventure in the Dubai desert',
            location: 'Dubai, UAE',
            price: 175,
            currency: 'USD',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80',
            tags: ['adventure', 'desert'],
            validUntil: '2024-12-31',
            confidence: 0.85
          }
        ],
        trendingDestinations: [],
        deals: []
      });
    }
  }, [isAuthenticated]);

  // Load flight insights
  const loadFlightInsights = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const flightInsights = await dashboardService.getFlightInsights();
      updateData({ flightInsights });
    } catch (error) {
      console.error('Failed to load flight insights:', error);
      updateData({ flightInsights: [] });
    }
  }, [isAuthenticated]);

  // Load price alerts
  const loadPriceAlerts = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const priceAlerts = await dashboardService.getPriceAlerts();
      updateData({ priceAlerts });
    } catch (error) {
      console.error('Failed to load price alerts:', error);
      updateData({ priceAlerts: [] });
    }
  }, [isAuthenticated]);

  // Load travel stats
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const stats = await dashboardService.getTravelStats();
      updateData({ stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
      updateData({
        stats: {
          totalBookings: 5,
          totalSpent: 12500,
          countriesVisited: 8,
          favoriteDestination: 'Paris',
          averageTripDuration: 7,
          upcomingTrips: 1
        }
      });
    }
  }, [isAuthenticated]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadProfile(),
        loadBookings(),
        loadSearchHistory(),
        loadRecommendations(),
        loadFlightInsights(),
        loadPriceAlerts(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    loadProfile,
    loadBookings,
    loadSearchHistory,
    loadRecommendations,
    loadFlightInsights,
    loadPriceAlerts,
    loadStats
  ]);

  // Refresh specific data
  const refreshProfile = useCallback(async () => {
    setLoading(true);
    await loadProfile();
    setLoading(false);
  }, [loadProfile]);

  const refreshBookings = useCallback(async () => {
    setLoading(true);
    await loadBookings();
    setLoading(false);
  }, [loadBookings]);

  const refreshRecommendations = useCallback(async () => {
    setLoading(true);
    await loadRecommendations();
    setLoading(false);
  }, [loadRecommendations]);

  // Quick actions
  const quickSearch = useCallback(async (type: 'flight' | 'hotel' | 'activity', params: any) => {
    try {
      switch (type) {
        case 'flight':
          return await dashboardService.quickFlightSearch(params);
        case 'hotel':
          return await dashboardService.quickHotelSearch(params);
        case 'activity':
          return await dashboardService.quickActivitySearch(params);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Quick ${type} search failed:`, error);
      return [];
    }
  }, []);

  const createPriceAlert = useCallback(async (alertData: any) => {
    try {
      const newAlert = await dashboardService.createPriceAlert(alertData);
      updateData({ priceAlerts: [...state.priceAlerts, newAlert] });
      return newAlert;
    } catch (error) {
      console.error('Failed to create price alert:', error);
      throw error;
    }
  }, [state.priceAlerts]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const updatedProfile = await dashboardService.updateUserProfile(updates);
      updateData({ profile: updatedProfile });
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, []);

  // Load data on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    } else {
      // Clear data when not authenticated
      setState({
        profile: null,
        upcomingTrips: [],
        recentBookings: [],
        searchHistory: [],
        recentSearches: [],
        recommendations: [],
        trendingDestinations: [],
        deals: [],
        flightInsights: [],
        priceAlerts: [],
        stats: null,
        loading: false,
        error: null,
      });
    }
  }, [isAuthenticated, loadDashboardData]);

  return {
    ...state,
    // Actions
    loadDashboardData,
    refreshProfile,
    refreshBookings,
    refreshRecommendations,
    quickSearch,
    createPriceAlert,
    updateProfile,
    // Individual loaders
    loadProfile,
    loadBookings,
    loadSearchHistory,
    loadRecommendations,
    loadFlightInsights,
    loadPriceAlerts,
    loadStats,
  };
};

export default useDashboard;
