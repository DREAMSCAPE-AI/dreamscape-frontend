import { useCallback } from 'react';
import { historyService } from '@/services/historyService';
import { useAuth } from '@/services/auth/AuthService';
import type { HistoryActionType, HistoryEntityType, CreateHistoryEntry } from '@/types/history';

/**
 * Hook for tracking user actions in history
 * Provides easy-to-use methods for common tracking scenarios
 */
export function useHistoryTracking() {
  const { isAuthenticated } = useAuth();

  /**
   * Track a generic user action
   */
  const trackAction = useCallback(async (
    actionType: HistoryActionType,
    entityType: HistoryEntityType,
    entityId: string,
    metadata?: Record<string, unknown>
  ) => {
    console.log('[HistoryTracking] trackAction called:', { actionType, entityType, entityId, isAuthenticated });

    // Only track if user is authenticated
    if (!isAuthenticated) {
      console.log('[HistoryTracking] Skipping - user not authenticated');
      return;
    }

    try {
      const entry: CreateHistoryEntry = {
        actionType,
        entityType,
        entityId,
        metadata,
      };
      console.log('[HistoryTracking] Sending entry:', entry);
      const result = await historyService.trackAction(entry);
      console.log('[HistoryTracking] Success:', result);
    } catch (error) {
      // Silently fail - don't break the app for history tracking issues
      console.warn('[HistoryTracking] Failed to track action:', error);
    }
  }, [isAuthenticated]);

  /**
   * Track when user views a hotel
   */
  const trackHotelView = useCallback((hotelId: string, hotelName?: string) => {
    return trackAction('VIEWED', 'hotel', hotelId, { hotelName });
  }, [trackAction]);

  /**
   * Track when user favorites a hotel
   */
  const trackHotelFavorite = useCallback((hotelId: string, hotelName?: string) => {
    return trackAction('FAVORITED', 'hotel', hotelId, { hotelName });
  }, [trackAction]);

  /**
   * Track when user unfavorites a hotel
   */
  const trackHotelUnfavorite = useCallback((hotelId: string, hotelName?: string) => {
    return trackAction('UNFAVORITED', 'hotel', hotelId, { hotelName });
  }, [trackAction]);

  /**
   * Track when user views a flight
   */
  const trackFlightView = useCallback((flightId: string, flightInfo?: string) => {
    return trackAction('VIEWED', 'flight', flightId, { name: flightInfo });
  }, [trackAction]);

  /**
   * Track when user favorites a flight
   */
  const trackFlightFavorite = useCallback((flightId: string, flightInfo?: string) => {
    return trackAction('FAVORITED', 'flight', flightId, { name: flightInfo });
  }, [trackAction]);

  /**
   * Track when user unfavorites a flight
   */
  const trackFlightUnfavorite = useCallback((flightId: string, flightInfo?: string) => {
    return trackAction('UNFAVORITED', 'flight', flightId, { name: flightInfo });
  }, [trackAction]);

  /**
   * Track when user performs a search
   */
  const trackSearch = useCallback((query: string, searchType: 'hotel' | 'flight' | 'destination' | 'activity' = 'destination') => {
    return trackAction('SEARCHED', searchType, `search-${Date.now()}`, { query });
  }, [trackAction]);

  /**
   * Track when user views a destination
   */
  const trackDestinationView = useCallback((destinationId: string, destinationName?: string) => {
    return trackAction('VIEWED', 'destination', destinationId, { destinationName });
  }, [trackAction]);

  /**
   * Track when user favorites a destination
   */
  const trackDestinationFavorite = useCallback((destinationId: string, destinationName?: string) => {
    return trackAction('FAVORITED', 'destination', destinationId, { destinationName });
  }, [trackAction]);

  /**
   * Track when user views an activity
   */
  const trackActivityView = useCallback((activityId: string, activityName?: string) => {
    return trackAction('VIEWED', 'activity', activityId, { name: activityName });
  }, [trackAction]);

  /**
   * Track when user creates a booking
   */
  const trackBookingCreated = useCallback((bookingId: string, bookingDetails?: Record<string, unknown>) => {
    return trackAction('CREATED', 'booking', bookingId, bookingDetails);
  }, [trackAction]);

  return {
    trackAction,
    trackHotelView,
    trackHotelFavorite,
    trackHotelUnfavorite,
    trackFlightView,
    trackFlightFavorite,
    trackFlightUnfavorite,
    trackSearch,
    trackDestinationView,
    trackDestinationFavorite,
    trackActivityView,
    trackBookingCreated,
  };
}

export default useHistoryTracking;
