/**
 * Itinerary Types - Compatible with Cart system
 */

import type { CartItemType, FlightItemData, HotelItemData, ActivityItemData } from './cart';

export type ItineraryItemType = CartItemType;

export type ItineraryItemData = FlightItemData | HotelItemData | ActivityItemData;

export interface ItineraryItem {
  id: string;
  itineraryId: string;
  type: ItineraryItemType;

  // Cart compatibility fields
  itemId: string | null;
  itemData: ItineraryItemData;
  price: number;
  currency: string;
  quantity: number;

  // Display fields (derived from itemData)
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string;

  // UI fields
  order: number;
  createdAt: string;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  items?: ItineraryItem[];
}

export interface CreateItineraryDto {
  title: string;
  startDate: string;
  endDate: string;
  destinations?: string[];
}

export interface UpdateItineraryDto {
  title?: string;
  startDate?: string;
  endDate?: string;
  destinations?: string[];
}

export interface CreateItineraryItemDto {
  type: ItineraryItemType;

  // Cart compatibility fields
  itemId?: string;
  itemData: ItineraryItemData;
  price: number;
  currency?: string;
  quantity?: number;

  // Display fields (will be derived from itemData if not provided)
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;

  // UI fields
  order?: number;
}

export interface UpdateItineraryItemDto {
  type?: ItineraryItemType;
  itemId?: string;
  itemData?: ItineraryItemData;
  price?: number;
  currency?: string;
  quantity?: number;
  title?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  location?: string;
  order?: number;
}

export interface ReorderItemsDto {
  items: Array<{
    id: string;
    order: number;
  }>;
}

export type ExportFormat = 'pdf' | 'ical' | 'email';
