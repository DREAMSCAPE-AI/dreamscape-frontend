<<<<<<< HEAD
/**
 * AI Recommendations Service
 *
 * Service for fetching personalized recommendations from the AI service
 * for flights, accommodations, and activities.
 */

import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3005';

export type RecommendationType = 'flights' | 'accommodations' | 'activities';

export interface FlightRecommendationParams {
  userId: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  tripPurpose?: 'LEISURE' | 'BUSINESS' | 'FAMILY' | 'ROMANTIC';
  budgetPerPerson?: number;
  preferDirectFlights?: boolean;
=======
import axios from 'axios';

const resolveBaseUrl = (envValue?: string) => {
  const trimmed = (envValue || '').trim();
  if (trimmed) return trimmed;
  return '/api'; // Fallback to API Gateway
};

const AI_SERVICE_URL = resolveBaseUrl(import.meta.env.VITE_AI_SERVICE_URL);

// Create axios instance
const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // AI operations may take longer
});

// Add auth token to requests
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export type RecommendationCategory = 'flights' | 'accommodations' | 'activities';

export interface RecommendationResponse {
  success: boolean;
  data: {
    userId: string;
    recommendations: any[];
    totalCount: number;
    metadata: {
      generatedAt: string;
      vectorDimensions: number;
      cacheHit: boolean;
      processingTime: number;
    };
  };
}

export interface FlightRecommendationParams {
  userId: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: string;
>>>>>>> dev
  limit?: number;
}

export interface ActivityRecommendationParams {
  userId: string;
<<<<<<< HEAD
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  startDate?: string;
  endDate?: string;
  stayDuration?: number;
  travelCompanions?: string;
  budgetPerActivity?: number;
=======
  destination?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
>>>>>>> dev
  limit?: number;
}

export interface AccommodationRecommendationParams {
  userId: string;
<<<<<<< HEAD
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  rooms?: number;
  budgetPerNight?: number;
  limit?: number;
}

export interface RecommendationResponse<T = any> {
  userId: string;
  count: number;
  recommendations: T[];
  metadata: {
    processingTime: number;
    strategy: string;
    cacheHit: boolean;
  };
  context?: any;
}

/**
 * Get personalized flight recommendations
=======
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  limit?: number;
}

/**
 * Get flight recommendations from AI service
>>>>>>> dev
 */
export async function getFlightRecommendations(
  params: FlightRecommendationParams
): Promise<RecommendationResponse> {
  try {
<<<<<<< HEAD
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/recommendations/flights`, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('[AIRecommendations] Flight recommendations error:', error);
=======
    const response = await aiApi.get('/api/v1/recommendations/flights', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching flight recommendations:', error);
>>>>>>> dev
    throw error;
  }
}

/**
<<<<<<< HEAD
 * Get personalized activity recommendations
=======
 * Get activity recommendations from AI service
>>>>>>> dev
 */
export async function getActivityRecommendations(
  params: ActivityRecommendationParams
): Promise<RecommendationResponse> {
  try {
<<<<<<< HEAD
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/recommendations/activities`, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('[AIRecommendations] Activity recommendations error:', error);
=======
    const response = await aiApi.get('/api/v1/recommendations/activities', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching activity recommendations:', error);
>>>>>>> dev
    throw error;
  }
}

/**
<<<<<<< HEAD
 * Get personalized accommodation recommendations
=======
 * Get accommodation recommendations from AI service (placeholder for future)
>>>>>>> dev
 */
export async function getAccommodationRecommendations(
  params: AccommodationRecommendationParams
): Promise<RecommendationResponse> {
  try {
<<<<<<< HEAD
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/recommendations/accommodations`, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('[AIRecommendations] Accommodation recommendations error:', error);
=======
    // TODO: Implement when accommodation recommendations endpoint is ready
    console.warn('Accommodation recommendations not yet implemented');
    return {
      success: true,
      data: {
        userId: params.userId,
        recommendations: [],
        totalCount: 0,
        metadata: {
          generatedAt: new Date().toISOString(),
          vectorDimensions: 8,
          cacheHit: false,
          processingTime: 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching accommodation recommendations:', error);
>>>>>>> dev
    throw error;
  }
}

/**
<<<<<<< HEAD
 * Get all recommendations (flights + accommodations + activities)
 */
export async function getAllRecommendations(params: {
  userId: string;
  destination?: string;
  origin?: string;
  checkInDate?: string;
  checkOutDate?: string;
  departureDate?: string;
  returnDate?: string;
  adults: number;
  children?: number;
}): Promise<{
  flights?: RecommendationResponse;
  accommodations?: RecommendationResponse;
  activities?: RecommendationResponse;
}> {
  try {
    const results: any = {};

    // Fetch all recommendations in parallel
    const promises: Promise<any>[] = [];

    // Flights
    if (params.origin && params.destination && params.departureDate) {
      promises.push(
        getFlightRecommendations({
          userId: params.userId,
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
          children: params.children,
          limit: 10,
        }).then(data => ({ type: 'flights', data }))
      );
    }

    // Accommodations
    if (params.destination && params.checkInDate && params.checkOutDate) {
      promises.push(
        getAccommodationRecommendations({
          userId: params.userId,
          cityCode: params.destination,
          checkInDate: params.checkInDate,
          checkOutDate: params.checkOutDate,
          adults: params.adults,
          children: params.children,
          limit: 10,
        }).then(data => ({ type: 'accommodations', data }))
      );
    }

    // Activities
    if (params.destination) {
      promises.push(
        getActivityRecommendations({
          userId: params.userId,
          cityCode: params.destination,
          startDate: params.checkInDate,
          endDate: params.checkOutDate,
          limit: 10,
        }).then(data => ({ type: 'activities', data }))
      );
    }

    const responses = await Promise.allSettled(promises);

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        results[response.value.type] = response.value.data;
      }
    });

    return results;
  } catch (error) {
    console.error('[AIRecommendations] Get all recommendations error:', error);
    throw error;
  }
=======
 * Get all recommendations for selected categories
 */
export async function getAllRecommendations(
  userId: string,
  categories: RecommendationCategory[],
  searchParams: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    checkInDate?: string;
    checkOutDate?: string;
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    rooms?: number;
    travelClass?: string;
  }
): Promise<{
  flights?: RecommendationResponse;
  activities?: RecommendationResponse;
  accommodations?: RecommendationResponse;
}> {
  const promises: Promise<any>[] = [];
  const results: any = {};

  // Build promises for each category
  if (categories.includes('flights')) {
    promises.push(
      getFlightRecommendations({
        userId,
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.adults,
        children: searchParams.children,
        infants: searchParams.infants,
        travelClass: searchParams.travelClass,
        limit: 10
      }).then(data => ({ category: 'flights', data }))
    );
  }

  if (categories.includes('activities')) {
    promises.push(
      getActivityRecommendations({
        userId,
        destination: searchParams.destination,
        startDate: searchParams.startDate || searchParams.departureDate,
        endDate: searchParams.endDate || searchParams.departureDate,
        adults: searchParams.adults,
        limit: 10
      }).then(data => ({ category: 'activities', data }))
    );
  }

  if (categories.includes('accommodations')) {
    promises.push(
      getAccommodationRecommendations({
        userId,
        destination: searchParams.destination,
        checkInDate: searchParams.checkInDate || searchParams.departureDate,
        checkOutDate: searchParams.checkOutDate,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms || 1,
        limit: 10
      }).then(data => ({ category: 'accommodations', data }))
    );
  }

  // Execute all promises in parallel
  const settled = await Promise.allSettled(promises);

  // Process results
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { category, data } = result.value;
      results[category] = data;
    } else {
      console.error(`Failed to fetch ${categories[index]} recommendations:`, result.reason);
    }
  });

  return results;
>>>>>>> dev
}

/**
 * Track user interaction with a recommendation
 */
export async function trackRecommendationInteraction(
<<<<<<< HEAD
  type: RecommendationType,
  params: {
    userId: string;
    itemId: string;
    interactionType: 'view' | 'click' | 'book' | 'like' | 'dislike' | 'wishlist' | 'compare' | 'save';
  }
): Promise<void> {
  try {
    const endpoints = {
      flights: `${AI_SERVICE_URL}/api/v1/recommendations/flights/interactions`,
      accommodations: `${AI_SERVICE_URL}/api/v1/recommendations/accommodations/interactions`,
      activities: `${AI_SERVICE_URL}/api/v1/recommendations/activities/interactions`,
    };

    await axios.post(endpoints[type], {
      userId: params.userId,
      [`${type === 'flights' ? 'flight' : type === 'activities' ? 'activity' : 'accommodation'}Id`]: params.itemId,
      type: params.interactionType,
    });
  } catch (error) {
    console.error(`[AIRecommendations] Track ${type} interaction error:`, error);
    // Don't throw - tracking should not block user experience
=======
  category: RecommendationCategory,
  data: {
    userId: string;
    recommendationId: string;
    action: 'view' | 'click' | 'book';
    metadata?: any;
  }
): Promise<void> {
  try {
    const endpoints: Record<RecommendationCategory, string> = {
      flights: '/api/v1/recommendations/flights/interactions',
      activities: '/api/v1/recommendations/activities/interactions',
      accommodations: '/api/v1/recommendations/accommodations/interactions'
    };

    await aiApi.post(endpoints[category], data);
  } catch (error) {
    console.error(`Error tracking ${category} recommendation interaction:`, error);
    // Don't throw - tracking failures shouldn't break the UI
>>>>>>> dev
  }
}

export default {
  getFlightRecommendations,
  getActivityRecommendations,
  getAccommodationRecommendations,
  getAllRecommendations,
<<<<<<< HEAD
  trackRecommendationInteraction,
=======
  trackRecommendationInteraction
>>>>>>> dev
};
