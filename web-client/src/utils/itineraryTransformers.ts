/**
 * Transformation functions to convert search results into ItineraryItems
 */

import type { CreateItineraryItemDto } from '@/types/itinerary';
import type { FlightItemData, HotelItemData, ActivityItemData } from '@/types/cart';

/**
 * Transform flight search result to ItineraryItem
 * Handles both mock data structure and Amadeus API structure
 */
export function flightToItineraryItem(
  flight: any,
  customizations?: {
    seats?: any[];
    meals?: any[];
    baggage?: any[];
    passengers?: any[];
  }
): CreateItineraryItemDto {
  console.log('[flightToItineraryItem] Input flight:', flight);
  console.log('[flightToItineraryItem] Customizations:', customizations);

  // Extract origin/destination with multiple fallbacks (Amadeus API structure vs backend simplified format)
  // Backend format: departure: {airport: 'NCE', time: '...', terminal: '2'}
  const origin = flight.origin ||
    flight.departure?.airport || flight.departure?.code || flight.departure?.iataCode ||
    flight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || '';
  const destination = flight.destination ||
    flight.arrival?.airport || flight.arrival?.code || flight.arrival?.iataCode ||
    flight.itineraries?.[0]?.segments?.[flight.itineraries?.[0]?.segments?.length - 1]?.arrival?.iataCode || '';

  // Extract times with multiple fallbacks (backend format has departure.time/arrival.time)
  const departureDateTime = flight.departureTime ||
    flight.departure?.time || flight.departure?.at ||
    flight.itineraries?.[0]?.segments?.[0]?.departure?.at || new Date().toISOString();
  const arrivalDateTime = flight.arrivalTime ||
    flight.arrival?.time || flight.arrival?.at ||
    flight.itineraries?.[0]?.segments?.[flight.itineraries?.[0]?.segments?.length - 1]?.arrival?.at || new Date().toISOString();

  // Extract carrier info - backend format: airline: {code: 'AF', name: 'Air France'}
  const carrierCode = flight.airline?.code || flight.carrierCode || flight.validatingAirlineCodes?.[0] ||
    flight.itineraries?.[0]?.segments?.[0]?.carrierCode || '';
  const flightNum = flight.flightNumber || flight.number ||
    flight.itineraries?.[0]?.segments?.[0]?.number || '';

  // Extract duration - handle ISO format PT8H30M
  const duration = flight.duration || flight.itineraries?.[0]?.duration || '0h';

  // Build itemData with all fields needed for cart/checkout display
  const itemData: FlightItemData & Record<string, any> = {
    type: 'flight',
    flightNumber: flightNum || 'N/A',
    airline: flight.airline?.name || flight.airline || carrierCode || 'Unknown Airline',
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
    },
    // Include customizations if provided
    ...(customizations && {
      bookingDetails: {
        seats: customizations.seats || [],
        meals: customizations.meals || [],
        baggage: customizations.baggage || [],
        passengers: customizations.passengers || []
      }
    })
  };

  // Extract price - handle both Amadeus format and backend simplified format
  const priceObj = flight.price;
  let price = 0;
  if (typeof priceObj === 'object' && priceObj !== null) {
    price = priceObj?.total || priceObj?.grandTotal || priceObj?.amount || priceObj?.base || 0;
  } else if (typeof priceObj === 'number') {
    price = priceObj;
  } else if (typeof priceObj === 'string') {
    price = parseFloat(priceObj) || 0;
  }

  const currency = priceObj?.currency || flight.currency || 'USD';

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
  console.log('[hotelToItineraryItem] Input hotel:', hotel);

  // Use search params if hotel data is empty
  const checkInDate = hotel.searchCheckInDate || hotel.checkInDate || hotel.offers?.[0]?.checkInDate || hotel.checkIn;
  const checkOutDate = hotel.searchCheckOutDate || hotel.checkOutDate || hotel.offers?.[0]?.checkOutDate || hotel.checkOut;
  const cityCode = hotel.searchCityCode || hotel.cityCode;

  const itemData: HotelItemData = {
    type: 'hotel',
    name: hotel.name || hotel.hotel?.name || hotel.hotelName || 'Unknown Hotel',
    location: hotel.location?.name || hotel.address?.city || cityCode ||
              hotel.hotel?.address?.cityName || hotel.hotel?.cityCode || hotel.city || 'Unknown Location',
    checkInDate: checkInDate || new Date().toISOString(),
    checkOutDate: checkOutDate || new Date(Date.now() + 86400000).toISOString(), // +1 day
    roomType: hotel.roomType || hotel.room?.type || hotel.room?.description ||
              hotel.offers?.[0]?.room?.description?.text ||
              hotel.offers?.[0]?.room?.typeEstimated?.category || 'Standard Room',
    guests: hotel.searchAdults || hotel.guests || hotel.room?.guests || hotel.adults || 1,
    nights: hotel.nights || 1,
    rating: hotel.rating || hotel.hotelRating,
    imageUrl: hotel.imageUrl || hotel.media?.[0]?.uri
  };

  // Extract price - handle both Amadeus format and backend simplified format
  const priceObj = hotel.price || hotel.offers?.[0]?.price;
  let price = 0;
  if (typeof priceObj === 'object' && priceObj !== null) {
    // Backend format: {amount, currency, perNight, base, taxes} or Amadeus format: {total, currency}
    price = priceObj?.total || priceObj?.amount || priceObj?.base || 0;
  } else if (typeof priceObj === 'number') {
    price = priceObj;
  } else if (typeof priceObj === 'string') {
    price = parseFloat(priceObj) || 0;
  }

  // If price is still 0, use a minimum price based on nights
  if (price === 0 && itemData.nights) {
    price = itemData.nights * 50; // Default: 50 EUR per night
    console.warn('[hotelToItineraryItem] Price was 0, using default:', price);
  }

  const currency = priceObj?.currency || hotel.currency || 'EUR';

  // Calculate nights if not provided
  if (itemData.checkInDate && itemData.checkOutDate) {
    const checkIn = new Date(itemData.checkInDate);
    const checkOut = new Date(itemData.checkOutDate);
    const calculatedNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (calculatedNights > 0) {
      itemData.nights = calculatedNights;
    }
  }

  const result = {
    type: 'HOTEL' as const,
    itemId: hotel.hotelId || hotel.hotel?.hotelId || hotel.id || hotel.offerId,
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

  console.log('[hotelToItineraryItem] Output DTO:', result);
  return result;
}

/**
 * Transform activity search result to ItineraryItem
 */
export function activityToItineraryItem(activity: any): CreateItineraryItemDto {
  console.log('[activityToItineraryItem] Input activity:', activity);

  // Determine location safely - handle both string and object formats
  let locationStr = 'Unknown Location';
  if (typeof activity.location === 'string') {
    locationStr = activity.location;
  } else if (activity.location?.name) {
    locationStr = activity.location.name;
  } else if (activity.city) {
    locationStr = activity.city;
  } else if (activity.geoCode?.latitude && activity.geoCode?.longitude) {
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

  // Extract price - handle both Amadeus format and backend simplified format
  const priceObj = activity.price;
  let price = 0;
  if (typeof priceObj === 'object' && priceObj !== null) {
    price = priceObj?.amount || priceObj?.total || priceObj?.base || 0;
  } else if (typeof priceObj === 'number') {
    price = priceObj;
  } else if (typeof priceObj === 'string') {
    price = parseFloat(priceObj) || 0;
  }

  const currency = priceObj?.currencyCode || priceObj?.currency || activity.currency || 'USD';

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
