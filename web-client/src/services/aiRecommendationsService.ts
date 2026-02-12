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
  limit?: number;
}

export interface ActivityRecommendationParams {
  userId: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
  limit?: number;
}

export interface AccommodationRecommendationParams {
  userId: string;
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
 */
export async function getFlightRecommendations(
  params: FlightRecommendationParams
): Promise<RecommendationResponse> {
  try {
    const response = await aiApi.get('/api/v1/recommendations/flights', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching flight recommendations:', error);
    throw error;
  }
}

/**
 * Get activity recommendations from AI service
 */
export async function getActivityRecommendations(
  params: ActivityRecommendationParams
): Promise<RecommendationResponse> {
  try {
    const response = await aiApi.get('/api/v1/recommendations/activities', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching activity recommendations:', error);
    throw error;
  }
}

/**
 * Get accommodation recommendations from AI service (placeholder for future)
 */
export async function getAccommodationRecommendations(
  params: AccommodationRecommendationParams
): Promise<RecommendationResponse> {
  try {
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
    throw error;
  }
}

/**
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
}

/**
 * Track user interaction with a recommendation
 */
export async function trackRecommendationInteraction(
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
  }
}

export default {
  getFlightRecommendations,
  getActivityRecommendations,
  getAccommodationRecommendations,
  getAllRecommendations,
  trackRecommendationInteraction
};
