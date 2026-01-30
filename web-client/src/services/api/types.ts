// API Response Types
export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure: FlightEndPoint;
  arrival: FlightEndPoint;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightEndPoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees: Fee[];
  grandTotal: string;
  additionalServices?: AdditionalService[];
}

export interface Fee {
  amount: string;
  type: string;
}

export interface AdditionalService {
  amount: string;
  type: string;
}

export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetails[];
}

export interface FareDetails {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  class: string;
  includedCheckedBags: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
  };
}

// Hotel Types - Aligned with backend SimplifiedHotelOfferDTO
export interface HotelOffer {
  id: string;
  hotelId: string;
  name: string;
  cityCode: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    distance?: number;
    distanceUnit?: string;
  };
  address: {
    street: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
  };
  rating: number | null;
  reviewCount: number | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  price: {
    amount: number;
    currency: string;
    perNight: number;
    base?: number;
    taxes?: number;
  };
  room: {
    type: string;
    description: string | null;
    beds: number | null;
    bedType: string | null;
    guests: number;
  };
  amenities: string[];
  images: string[];
  cancellation: {
    freeCancellation: boolean;
    deadline: string | null;
    penalty: number | null;
  };
  chainCode: string | null;
  contact: {
    phone: string | null;
    email: string | null;
  } | null;
}

export interface Media {
  uri: string;
  category: string;
}

export interface Policy {
  type: string;
  description: {
    text: string;
    lang: string;
  };
}

export interface Room {
  type: string;
  typeEstimated: {
    category: string;
    beds: number;
    bedType: string;
  };
  description: {
    text: string;
    lang: string;
  };
}

// Transfer Types
export interface TransferOffer {
  id: string;
  type: string;
  vehicleType: string;
  price: Price;
  provider: string;
}

// Experience Types
export interface Experience {
  id: string;
  title: string;
  location: string;
  category: string;
  duration: string;
  price: Price;
  rating: number;
  images: string[];
}

// Market Insight Types
export interface MarketInsight {
  destination: string;
  travelPeriod: string;
  popularity: number;
  priceIndex: number;
  seasonality: string;
}

// API Request Types
export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  includedAirlineCodes?: string[];
  excludedAirlineCodes?: string[];
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number;
}

export interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  roomQuantity: number;
  adults: number;
  childAges?: number[];
  priceRange?: string;
  currency?: string;
  ratings?: string[];
  amenities?: string[];
  hotelIds?: string[];
}

export interface TransferSearchParams {
  startLocationCode: string;
  endLocationCode: string;
  startDateTime: string;
  passengers: number;
  vehicleType?: string;
}

export interface ExperienceSearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface FlightDestinationParams {
  origin: string;
  maxPrice?: number;
  departureDate?: string;
}

export interface ActivitySearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  north?: number;
  west?: number;
  south?: number;
  east?: number;
  locationName?: string; // City/location name for better location display
}

export interface LocationSearchParams {
  keyword: string;
  subType?: string;
  countryCode?: string;
}

export interface AirportSearchParams {
  keyword: string;
}

// UI Component Types (for frontend forms)
export interface UIFlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  flexibleDates?: boolean;
  nearbyAirports?: boolean;
  maxPrice?: number;
  max?: number;
}

// API Error Types
export interface APIError {
  code: string;
  title: string;
  detail: string;
  status: number;
  source?: {
    parameter?: string;
    pointer?: string;
  };
}