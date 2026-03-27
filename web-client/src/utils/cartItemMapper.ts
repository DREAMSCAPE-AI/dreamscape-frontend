/**
 * cartItemMapper.ts
 *
 * Maps raw AI recommendation proposals to itinerary items.
 * Called when the user selects a proposal in AIRecommendationModal.
 */

import { CartItemType, type FlightItemData, type HotelItemData, type ActivityItemData, type AddToCartRequest } from '@/types/cart';
import type { CreateItineraryItemDto } from '@/types/itinerary';
import type { Proposal, RawFlightRecommendation, RawAccommodationRecommendation, RawActivityRecommendation } from '@/components/dashboard/AIRecommendationModal';

export function buildItineraryItem(proposal: Proposal): CreateItineraryItemDto | null {
  const now = Date.now();
  const plus30d = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
  const plus37d = new Date(now + 37 * 24 * 60 * 60 * 1000).toISOString();

  if (proposal.type === 'flight') {
    const raw = proposal.raw as RawFlightRecommendation;
    const itemData: FlightItemData = {
      type: 'flight',
      flightNumber: proposal.id,
      airline: raw.airline,
      origin: raw.origin,
      destination: raw.destination,
      departureTime: plus30d,
      arrivalTime: plus37d,
      duration: raw.duration,
      cabinClass: raw.cabinClass,
      passengers: { adults: 1 },
    };
    return {
      type: CartItemType.FLIGHT,
      itemId: proposal.id,
      itemData,
      price: proposal.price,
      currency: proposal.currency,
      quantity: 1,
      title: proposal.title,
      description: proposal.subtitle,
      startDate: plus30d,
      endDate: plus37d,
      location: proposal.location,
      order: 0,
    };
  }

  if (proposal.type === 'hotel') {
    const raw = proposal.raw as RawAccommodationRecommendation;
    const itemData: HotelItemData = {
      type: 'hotel',
      name: raw.name,
      location: raw.location ?? proposal.location,
      checkInDate: plus30d,
      checkOutDate: plus37d,
      roomType: 'Standard',
      guests: 1,
      nights: 7,
      rating: raw.rating,
      imageUrl: raw.imageUrl,
    };
    return {
      type: CartItemType.HOTEL,
      itemId: proposal.id,
      itemData,
      price: proposal.price,
      currency: proposal.currency,
      quantity: 1,
      title: proposal.title,
      description: proposal.subtitle,
      startDate: plus30d,
      endDate: plus37d,
      location: proposal.location,
      order: 1,
    };
  }

  if (proposal.type === 'activity') {
    const raw = proposal.raw as RawActivityRecommendation;
    const itemData: ActivityItemData = {
      type: 'activity',
      name: raw.name,
      location: raw.location?.address ?? raw.geoCode?.label ?? proposal.location,
      date: plus30d,
      duration: '2h',
      participants: 1,
      description: raw.shortDescription,
      imageUrl: raw.pictures?.[0],
    };
    return {
      type: CartItemType.ACTIVITY,
      itemId: proposal.id,
      itemData,
      price: proposal.price,
      currency: proposal.currency,
      quantity: 1,
      title: proposal.title,
      description: proposal.subtitle,
      startDate: plus30d,
      endDate: plus37d,
      location: proposal.location,
      order: 2,
    };
  }

  return null;
}

export function buildCartItem(proposal: Proposal, userId: string): AddToCartRequest | null {
  const dto = buildItineraryItem(proposal);
  if (!dto) return null;
  return {
    userId,
    type: dto.type,
    itemId: dto.itemId ?? proposal.id,
    itemData: dto.itemData,
    price: dto.price,
    quantity: dto.quantity ?? 1,
    currency: dto.currency,
  };
}
