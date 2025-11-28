import type { FlightOffer } from '@/services/api/types';

/**
 * Parse ISO 8601 duration string to total minutes
 * Example: "PT2H30M" → 150 minutes
 * @param duration ISO 8601 duration string
 * @returns Total duration in minutes
 */
export const parseDuration = (duration: string): number => {
  try {
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    return hours * 60 + minutes;
  } catch {
    return 0;
  }
};

/**
 * Safely extract and parse flight price as number
 * @param flight FlightOffer object
 * @returns Price as number, 0 if invalid
 */
export const getFlightPrice = (flight: FlightOffer): number => {
  try {
    return parseFloat(flight.price?.total || '0') || 0;
  } catch {
    return 0;
  }
};

/**
 * Extract departure time as Date object from first segment
 * @param flight FlightOffer object
 * @returns Departure Date, epoch if invalid
 */
export const getDepartureTime = (flight: FlightOffer): Date => {
  try {
    const departureAt = flight.itineraries?.[0]?.segments?.[0]?.departure?.at;
    if (!departureAt) {
      return new Date(0); // Fallback to epoch
    }
    return new Date(departureAt);
  } catch {
    return new Date(0);
  }
};

/**
 * Extract number of stops from first itinerary's first segment
 * @param flight FlightOffer object
 * @returns Number of stops, 0 if invalid
 */
export const getNumberOfStops = (flight: FlightOffer): number => {
  try {
    return flight.itineraries?.[0]?.segments?.[0]?.numberOfStops || 0;
  } catch {
    return 0;
  }
};

/**
 * Check if departure time falls within selected time ranges
 * Ranges: 'early' (0-6), 'morning' (6-12), 'afternoon' (12-18), 'evening' (18-24)
 * @param departureTime Departure Date object
 * @param ranges Array of selected time range strings
 * @returns True if time matches any selected range, or if no ranges selected
 */
export const isInDepartureTimeRange = (
  departureTime: Date,
  ranges: string[]
): boolean => {
  if (ranges.length === 0) return true; // No filter = show all

  const hour = departureTime.getHours();

  return ranges.some(range => {
    switch (range) {
      case 'early':
        return hour >= 0 && hour < 6;
      case 'morning':
        return hour >= 6 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 18;
      case 'evening':
        return hour >= 18 && hour < 24;
      default:
        return false;
    }
  });
};

/**
 * Check if price falls within range
 * @param price Flight price
 * @param min Minimum price (undefined = no minimum)
 * @param max Maximum price (undefined = no maximum)
 * @returns True if price is within range
 */
export const isInPriceRange = (
  price: number,
  min: number | undefined,
  max: number | undefined
): boolean => {
  const hasMin = min !== undefined && min !== null && !isNaN(min);
  const hasMax = max !== undefined && max !== null && !isNaN(max);

  if (!hasMin && !hasMax) return true; // No filter = show all

  if (hasMin && price < min) return false;
  if (hasMax && price > max) return false;

  return true;
};

/**
 * Check if flight stops match selected filters
 * Handle "2+" logic (2 or more stops)
 * @param stops Number of stops in the flight
 * @param stopsFilter Array of selected stop counts (0, 1, or 2 for 2+)
 * @returns True if stops match filter, or if no filter selected
 */
export const matchesStopsFilter = (
  stops: number,
  stopsFilter: number[]
): boolean => {
  if (stopsFilter.length === 0) return true; // No filter = show all

  return stopsFilter.some(filterValue => {
    if (filterValue === 2) {
      // 2+ filter matches 2 or more stops
      return stops >= 2;
    }
    return stops === filterValue;
  });
};
