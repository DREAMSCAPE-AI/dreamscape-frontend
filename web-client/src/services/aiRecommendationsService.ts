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
  limit?: number;
}

export interface ActivityRecommendationParams {
  userId: string;
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  startDate?: string;
  endDate?: string;
  stayDuration?: number;
  travelCompanions?: string;
  budgetPerActivity?: number;
  limit?: number;
}

export interface AccommodationRecommendationParams {
  userId: string;
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
 */
export async function getFlightRecommendations(
  params: FlightRecommendationParams
): Promise<RecommendationResponse> {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/recommendations/flights`, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('[AIRecommendations] Flight recommendations error:', error);
    throw error;
  }
}

/**
 * Get personalized activity recommendations
 */
export async function getActivityRecommendations(
  params: ActivityRecommendationParams
): Promise<RecommendationResponse> {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/recommendations/activities`, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('[AIRecommendations] Activity recommendations error:', error);
    throw error;
  }
}

/**
 * Get personalized accommodation recommendations
 */
export async function getAccommodationRecommendations(
  params: AccommodationRecommendationParams
): Promise<RecommendationResponse> {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/recommendations/accommodations`, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('[AIRecommendations] Accommodation recommendations error:', error);
    throw error;
  }
}

/**
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
}

/**
 * Track user interaction with a recommendation
 */
export async function trackRecommendationInteraction(
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
  }
}

export default {
  getFlightRecommendations,
  getActivityRecommendations,
  getAccommodationRecommendations,
  getAllRecommendations,
  trackRecommendationInteraction,
};
