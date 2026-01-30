/**
 * Transformation functions to convert search results into ItineraryItems
 */

import type { CreateItineraryItemDto } from '@/types/itinerary';
import type { FlightItemData, HotelItemData, ActivityItemData } from '@/types/cart';

/**
 * Transform flight search result to ItineraryItem
 * Handles both mock data structure and Amadeus API structure
 */
export function flightToItineraryItem(flight: any): CreateItineraryItemDto {
  console.log('[flightToItineraryItem] Input flight:', flight);

  // Extract origin/destination with multiple fallbacks (Amadeus API structure vs mock structure)
  const origin = flight.origin || flight.departure?.iataCode ||
    flight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || '';
  const destination = flight.destination || flight.arrival?.iataCode ||
    flight.itineraries?.[0]?.segments?.[flight.itineraries?.[0]?.segments?.length - 1]?.arrival?.iataCode || '';

  // Extract times with multiple fallbacks
  const departureDateTime = flight.departureTime || flight.departure?.at ||
    flight.itineraries?.[0]?.segments?.[0]?.departure?.at || new Date().toISOString();
  const arrivalDateTime = flight.arrivalTime || flight.arrival?.at ||
    flight.itineraries?.[0]?.segments?.[flight.itineraries?.[0]?.segments?.length - 1]?.arrival?.at || new Date().toISOString();

  // Extract carrier info
  const carrierCode = flight.carrierCode || flight.validatingAirlineCodes?.[0] ||
    flight.itineraries?.[0]?.segments?.[0]?.carrierCode || '';
  const flightNum = flight.flightNumber || flight.number ||
    flight.itineraries?.[0]?.segments?.[0]?.number || '';

  // Extract duration - handle ISO format PT8H30M
  const duration = flight.duration || flight.itineraries?.[0]?.duration || '0h';

  // Build itemData with all fields needed for cart/checkout display
  const itemData: FlightItemData & Record<string, any> = {
    type: 'flight',
    flightNumber: flightNum || 'N/A',
    airline: flight.airline || carrierCode || 'Unknown Airline',
    origin,
    destination,
    departureTime: departureDateTime,
    arrivalTime: arrivalDateTime,
    // Cart-compatible fields (same data, different field names)
    departureDate: departureDateTime,
    arrivalDate: arrivalDateTime,
    carrierCode,
    duration,
    cabinClass: flight.cabinClass || flight.class || 'economy',
    passengers: flight.passengers || {
      adults: 1,
      children: 0,
      infants: 0
    }
  };

  const price = flight.price?.total || flight.price?.grandTotal || flight.price || 0;
  const currency = flight.price?.currency || flight.currency || 'USD';

  const result = {
    type: 'FLIGHT' as const,
    itemId: flight.id || flight.offerId,
    itemData: itemData as any,
    price: parseFloat(price.toString()),
    currency,
    quantity: 1,
    title: `Flight ${itemData.flightNumber} - ${itemData.origin} to ${itemData.destination}`,
    description: `${itemData.airline} - ${itemData.cabinClass}`,
    startDate: itemData.departureTime,
    endDate: itemData.arrivalTime,
    location: itemData.origin,
    order: 0
  };

  console.log('[flightToItineraryItem] Output DTO:', result);
  return result;
}

/**
 * Transform hotel search result to ItineraryItem
 */
export function hotelToItineraryItem(hotel: any): CreateItineraryItemDto {
  const itemData: HotelItemData = {
    type: 'hotel',
    name: hotel.name || hotel.hotelName || 'Unknown Hotel',
    location: hotel.location || hotel.address?.cityName || hotel.city || '',
    checkInDate: hotel.checkInDate || hotel.checkIn || new Date().toISOString(),
    checkOutDate: hotel.checkOutDate || hotel.checkOut || new Date().toISOString(),
    roomType: hotel.roomType || hotel.room?.typeEstimated?.category || 'Standard Room',
    guests: hotel.guests || hotel.adults || 1,
    nights: hotel.nights || 1,
    rating: hotel.rating || hotel.hotelRating,
    imageUrl: hotel.imageUrl || hotel.media?.[0]?.uri
  };

  const price = hotel.price?.total || hotel.offers?.[0]?.price?.total || hotel.price || 0;
  const currency = hotel.price?.currency || hotel.offers?.[0]?.price?.currency || hotel.currency || 'USD';

  // Calculate nights if not provided
  if (!itemData.nights && itemData.checkInDate && itemData.checkOutDate) {
    const checkIn = new Date(itemData.checkInDate);
    const checkOut = new Date(itemData.checkOutDate);
    itemData.nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    type: 'HOTEL',
    itemId: hotel.id || hotel.hotelId || hotel.offerId,
    itemData: itemData as any,
    price: parseFloat(price.toString()),
    currency,
    quantity: 1,
    title: itemData.name,
    description: `${itemData.roomType} - ${itemData.nights} night${itemData.nights > 1 ? 's' : ''}`,
    startDate: itemData.checkInDate,
    endDate: itemData.checkOutDate,
    location: itemData.location,
    order: 0
  };
}

/**
 * Transform activity search result to ItineraryItem
 */
export function activityToItineraryItem(activity: any): CreateItineraryItemDto {
  console.log('[activityToItineraryItem] Input activity:', activity);

  // Determine location safely
  let locationStr = activity.location || activity.city || 'Unknown Location';
  if (locationStr === 'Unknown Location' && activity.geoCode?.latitude && activity.geoCode?.longitude) {
    locationStr = `${activity.geoCode.latitude}, ${activity.geoCode.longitude}`;
  }

  const itemData: ActivityItemData = {
    type: 'activity',
    name: activity.name || activity.title || 'Unknown Activity',
    location: locationStr,
    date: activity.date || activity.startDate || new Date().toISOString(),
    duration: activity.duration || '2h',
    participants: activity.participants || activity.adults || 1,
    description: activity.description || activity.shortDescription,
    imageUrl: activity.imageUrl || activity.pictures?.[0]
  };

  const price = activity.price?.amount || activity.price?.total || activity.price || 0;
  const currency = activity.price?.currencyCode || activity.price?.currency || activity.currency || 'USD';

  // Calculate end date if not provided
  const startDate = new Date(itemData.date);
  const durationHours = parseDuration(itemData.duration);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const result = {
    type: 'ACTIVITY' as const,
    itemId: activity.id || activity.activityId,
    itemData: itemData as any,
    price: parseFloat(price.toString()),
    currency,
    quantity: 1,
    title: itemData.name,
    description: itemData.description || `Duration: ${itemData.duration}`,
    startDate: itemData.date,
    endDate: endDate.toISOString(),
    location: itemData.location,
    order: 0
  };

  console.log('[activityToItineraryItem] Output DTO:', result);
  return result;
}

/**
 * Parse duration string to hours (e.g., "2h30m" -> 2.5)
 */
function parseDuration(duration: string): number {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  return hours + (minutes / 60);
}

/**
 * Helper to detect if an item is a flight/hotel/activity from its data structure
 */
export function detectItemType(item: any): 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | null {
  if (item.flightNumber || item.airline || item.departure) return 'FLIGHT';
  if (item.hotelName || item.checkInDate || item.roomType) return 'HOTEL';
  if (item.activity || item.duration || item.participants) return 'ACTIVITY';
  return null;
}

/**
 * Auto-transform any search result to ItineraryItem
 */
export function autoTransformToItineraryItem(item: any): CreateItineraryItemDto | null {
  const type = detectItemType(item);

  switch (type) {
    case 'FLIGHT':
      return flightToItineraryItem(item);
    case 'HOTEL':
      return hotelToItineraryItem(item);
    case 'ACTIVITY':
      return activityToItineraryItem(item);
    default:
      console.warn('[ItineraryTransformers] Unable to detect item type:', item);
      return null;
  }
}
