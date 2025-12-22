/**
 * Cart Types - Types for shopping cart functionality
 */

export enum CartItemType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  ACTIVITY = 'ACTIVITY'
}

export interface CartItem {
  id: string;
  cartId: string;
  type: CartItemType;
  itemId: string; // External ID (Amadeus offer ID, etc.)
  itemData: FlightItemData | HotelItemData | ActivityItemData;
  quantity: number;
  price: number;
  currency: string;
  createdAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  currency: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Item data interfaces for different types
export interface FlightItemData {
  type: 'flight';
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
}

export interface HotelItemData {
  type: 'hotel';
  name: string;
  location: string; // City or location name
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  guests: number; // Total number of guests
  nights: number;
  rating?: number;
  imageUrl?: string;
}

export interface ActivityItemData {
  type: 'activity';
  name: string;
  location: string;
  date: string;
  duration: string;
  participants: number;
  description?: string;
  imageUrl?: string;
}

// API Request/Response types
export interface AddToCartRequest {
  userId: string;
  type: CartItemType;
  itemId: string;
  itemData: FlightItemData | HotelItemData | ActivityItemData;
  price: number;
  quantity?: number;
  currency?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CheckoutRequest {
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutResponse {
  bookingReference: string;
  bookingId: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    type: string;
    itemId: string;
    itemData: unknown;
    quantity: number;
    price: number;
    currency: string;
  }>;
  status: string;
  createdAt: string;
  payment: {
    clientSecret: string | null;
    publishableKey: string | null;
    paymentIntentId: string;
  };
}

// API Response wrappers
export interface CartResponse {
  data: Cart | null;
  meta: {
    itemCount?: number;
    expiresAt?: string;
    message?: string;
  };
}

export interface CartItemResponse {
  data: Cart;
  meta: {
    itemCount: number;
    totalPrice: number;
    expiresAt?: string;
    message: string;
  };
}
