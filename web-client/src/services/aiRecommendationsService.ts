import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL;

// Create axios instance
const aiApi = axios.create({
  baseURL: `${AI_SERVICE_URL}/v1`,
  timeout: 60000,
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

// Shared user-profile enrichment sent to every AI endpoint
interface UserProfileContext {
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  travelTypes?: string[];
  accommodationTypes?: string[];
  activityTypes?: string[];
  preferredDestinations?: string[];
  comfortLevel?: string;
  travelStyle?: string;
  travelGroupType?: string;
  activityLevel?: string;
}

export interface FlightRecommendationParams extends UserProfileContext {
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

export interface ActivityRecommendationParams extends UserProfileContext {
  userId: string;
  cityCode?: string; // Backend expects cityCode (IATA code), not destination name
  startDate?: string;
  endDate?: string;
  adults?: number;
  limit?: number;
}

export interface AccommodationRecommendationParams extends UserProfileContext {
  userId: string;
  cityCode?: string; // Backend expects cityCode (IATA code), not destination name
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
    console.log('[AI Service] Requesting flight recommendations:', params);

    // Filter params: only send essential search params, not user profile data
    // Backend will load user profile from database via mergeUserProfileToContext
    const essentialParams = {
      userId: params.userId,
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      travelClass: params.travelClass,
      limit: params.limit,
    };

    const response = await aiApi.get('/recommendations/flights', { params: essentialParams });

    // Check if response indicates a specific error strategy
    const strategy = response.data.metadata?.strategy;
    const error = response.data.metadata?.error;

    if (strategy === 'invalid_params') {
      throw new Error('Paramètres de recherche invalides. Veuillez vérifier vos dates et destinations.');
    }

    if (strategy === 'voyage_timeout') {
      throw new Error('Le service de recherche de vols est temporairement indisponible. Veuillez réessayer dans quelques instants.');
    }

    if (strategy === 'voyage_error' || strategy === 'amadeus_error') {
      throw new Error('Erreur du service de recherche de vols. Veuillez réessayer.');
    }

    if (strategy === 'failed') {
      throw new Error(error || 'Impossible de charger les recommandations de vols. Veuillez réessayer.');
    }

    // Adapt backend response to frontend format
    return {
      success: true,
      data: {
        userId: response.data.userId,
        recommendations: response.data.recommendations || [],
        totalCount: response.data.count || 0,
        metadata: {
          generatedAt: new Date().toISOString(),
          vectorDimensions: 8,
          cacheHit: response.data.metadata?.cacheHit || false,
          processingTime: response.data.metadata?.processingTime || 0,
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching flight recommendations:', error);

    // Re-throw with user-friendly message if not already formatted
    if (error.message && (error.message.includes('Paramètres') || error.message.includes('service'))) {
      throw error; // Already formatted
    }

    if (error.response?.status === 400) {
      throw new Error('Paramètres de recherche invalides. Veuillez vérifier votre origine, destination et dates.');
    }

    if (error.response?.status === 500) {
      throw new Error('Erreur serveur. Veuillez réessayer dans quelques instants.');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Le serveur met trop de temps à répondre. Veuillez réessayer.');
    }

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
    console.log('[AI Service] Requesting activity recommendations:', params);
    const response = await aiApi.get('/recommendations/activities', { params });

    // Check if response indicates a specific error strategy
    const strategy = response.data.metadata?.strategy;
    const error = response.data.metadata?.error;

    if (strategy === 'invalid_city_code') {
      throw new Error(`La destination "${params.cityCode}" n'est pas supportée. Veuillez sélectionner une destination parmi nos villes disponibles.`);
    }

    if (strategy === 'voyage_timeout') {
      throw new Error('Le service de recherche d\'activités est temporairement indisponible. Veuillez réessayer dans quelques instants.');
    }

    if (strategy === 'voyage_error') {
      throw new Error('Erreur du service de recherche d\'activités. Veuillez réessayer.');
    }

    if (strategy === 'failed') {
      throw new Error(error || 'Impossible de charger les recommandations. Veuillez réessayer.');
    }

    // Adapt backend response to frontend format
    return {
      success: true,
      data: {
        userId: response.data.userId,
        recommendations: response.data.recommendations || [],
        totalCount: response.data.count || 0,
        metadata: {
          generatedAt: new Date().toISOString(),
          vectorDimensions: 8,
          cacheHit: response.data.metadata?.cacheHit || false,
          processingTime: response.data.metadata?.processingTime || 0,
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching activity recommendations:', error);

    // Re-throw with user-friendly message if not already formatted
    if (error.message && error.message.includes('destination')) {
      throw error; // Already formatted
    }

    if (error.response?.status === 400) {
      throw new Error('Paramètres de recherche invalides. Veuillez vérifier votre destination.');
    }

    if (error.response?.status === 500) {
      throw new Error('Erreur serveur. Veuillez réessayer dans quelques instants.');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Le serveur met trop de temps à répondre. Veuillez réessayer.');
    }

    throw error;
  }
}

/**
 * Get accommodation recommendations from AI service
 */
export async function getAccommodationRecommendations(
  params: AccommodationRecommendationParams
): Promise<RecommendationResponse> {
  try {
    console.log('[AI Service] Requesting accommodation recommendations:', params);

    // Format array parameters as comma-separated strings for backend
    const formattedParams = {
      ...params,
      travelTypes: params.travelTypes?.join(','),
      accommodationTypes: params.accommodationTypes?.join(','),
      activityTypes: params.activityTypes?.join(','),
      preferredDestinations: params.preferredDestinations?.join(','),
    };

    console.log('[AI Service] Formatted params for backend:', formattedParams);

    const response = await aiApi.get('/recommendations/accommodations', { params: formattedParams });

    // Check if response indicates a specific error strategy
    const strategy = response.data.metadata?.strategy;
    const error = response.data.metadata?.error;

    if (strategy === 'invalid_params') {
      throw new Error('Paramètres de recherche invalides. Veuillez vérifier vos dates et destination.');
    }

    if (strategy === 'voyage_timeout') {
      throw new Error('Le service de recherche d\'hébergements est temporairement indisponible. Veuillez réessayer dans quelques instants.');
    }

    if (strategy === 'voyage_error') {
      throw new Error('Erreur du service de recherche d\'hébergements. Veuillez réessayer.');
    }

    if (strategy === 'failed') {
      throw new Error(error || 'Impossible de charger les recommandations d\'hébergements. Veuillez réessayer.');
    }

    // Adapt backend response to frontend format
    return {
      success: true,
      data: {
        userId: response.data.userId,
        recommendations: response.data.recommendations || [],
        totalCount: response.data.count || 0,
        metadata: {
          generatedAt: new Date().toISOString(),
          vectorDimensions: 8,
          cacheHit: response.data.metadata?.cacheHit || false,
          processingTime: response.data.metadata?.processingTime || 0,
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching accommodation recommendations:', error);

    // Re-throw with user-friendly message if not already formatted
    if (error.message && (error.message.includes('Paramètres') || error.message.includes('service'))) {
      throw error; // Already formatted
    }

    if (error.response?.status === 400) {
      throw new Error('Paramètres de recherche invalides. Veuillez vérifier votre destination et vos dates.');
    }

    if (error.response?.status === 500) {
      throw new Error('Erreur serveur. Veuillez réessayer dans quelques instants.');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Le serveur met trop de temps à répondre. Veuillez réessayer.');
    }

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
    // Search context
    // Search context
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
    // User profile enrichment
    budgetMin?: number;
    budgetMax?: number;
    currency?: string;
    travelTypes?: string[];
    accommodationTypes?: string[];
    activityTypes?: string[];
    preferredDestinations?: string[];
    comfortLevel?: string;
    travelStyle?: string;
    travelGroupType?: string;
    activityLevel?: string;
    // User profile enrichment
    budgetMin?: number;
    budgetMax?: number;
    currency?: string;
    travelTypes?: string[];
    accommodationTypes?: string[];
    activityTypes?: string[];
    preferredDestinations?: string[];
    comfortLevel?: string;
    travelStyle?: string;
    travelGroupType?: string;
    activityLevel?: string;
  }
): Promise<{
  flights?: RecommendationResponse;
  activities?: RecommendationResponse;
  accommodations?: RecommendationResponse;
}> {
  const promises: Promise<any>[] = [];
  const results: any = {};

  // Shared user profile context forwarded to every AI endpoint
  const profileCtx = {
    budgetMin:            searchParams.budgetMin,
    budgetMax:            searchParams.budgetMax,
    currency:             searchParams.currency,
    travelTypes:          searchParams.travelTypes,
    accommodationTypes:   searchParams.accommodationTypes,
    activityTypes:        searchParams.activityTypes,
    preferredDestinations: searchParams.preferredDestinations,
    comfortLevel:         searchParams.comfortLevel,
    travelStyle:          searchParams.travelStyle,
    travelGroupType:      searchParams.travelGroupType,
    activityLevel:        searchParams.activityLevel,
  };

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
        limit: 10,
        ...profileCtx,
      }).then(data => ({ category: 'flights', data }))
    );
  }

  if (categories.includes('activities')) {
    promises.push(
      getActivityRecommendations({
        userId,
        cityCode: searchParams.destination, // Map destination → cityCode
        startDate: searchParams.startDate || searchParams.departureDate,
        endDate: searchParams.endDate || searchParams.departureDate,
        adults: searchParams.adults,
        limit: 10,
        ...profileCtx,
      }).then(data => ({ category: 'activities', data }))
    );
  }

  if (categories.includes('accommodations')) {
    // Calculate checkOutDate if not provided (default: checkInDate + 7 days)
    const checkInDate = searchParams.checkInDate || searchParams.departureDate;
    let checkOutDate = searchParams.checkOutDate;

    if (!checkOutDate && checkInDate) {
      const checkIn = new Date(checkInDate);
      checkIn.setDate(checkIn.getDate() + 7);
      checkOutDate = checkIn.toISOString().split('T')[0];
    }

    promises.push(
      getAccommodationRecommendations({
        userId,
        cityCode: searchParams.destination, // Map destination → cityCode
        checkInDate,
        checkOutDate,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms || 1,
        limit: 10,
        ...profileCtx,
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
      flights: '/recommendations/flights/interactions',
      activities: '/recommendations/activities/interactions',
      accommodations: '/recommendations/accommodations/interactions'
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
  trackRecommendationInteraction,
};
