/**
 * CartItem - Individual cart item component
 * Displays item details with quantity controls and remove button
 */

import { Minus, Plus, Trash2, Plane, Hotel, MapPin } from 'lucide-react';
import type { CartItem as CartItemType, FlightItemData, HotelItemData } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isLoading?: boolean;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove, isLoading }: CartItemProps) => {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const renderItemIcon = () => {
    switch (item.type) {
      case 'FLIGHT':
        return <Plane className="w-5 h-5 text-orange-600" />;
      case 'HOTEL':
        return <Hotel className="w-5 h-5 text-pink-600" />;
      case 'ACTIVITY':
        return <MapPin className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const renderItemDetails = () => {
    // DEBUG: Log the actual data structure
    console.log(`[CartItem] Type: ${item.type}, ItemData:`, item.itemData);

    if (item.type === 'FLIGHT') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = item.itemData as any;

      // Handle new structure with origin/destination at root level
      if (data.origin && data.destination) {
        return (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{data.origin}</span>
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="font-bold text-gray-900">{data.destination}</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">
              {data.departureDate ? new Date(data.departureDate).toLocaleDateString('fr-FR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {data.validatingAirlineCodes?.[0] || data.carrierCode || 'Flight'}
            </p>
          </div>
        );
      }

      // Handle old structure with departure/arrival objects
      if (data.departure && data.arrival) {
        return (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{data.departure?.iataCode || 'N/A'}</span>
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="font-bold text-gray-900">{data.arrival?.iataCode || 'N/A'}</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">
              {data.departure?.at ? new Date(data.departure.at).toLocaleDateString('fr-FR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {data.carrierCode || ''} {data.number ? `${data.number}` : ''} • {data.aircraft?.code || 'ECONOMY'}
            </p>
          </div>
        );
      }

      // Fallback for typed interface structure
      const typedData = data as FlightItemData;
      return (
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{typedData.airline} {typedData.flightNumber}</h4>
          <p className="text-sm text-gray-600">
            {typedData.origin} → {typedData.destination}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(typedData.departureTime).toLocaleDateString()} • {typedData.cabinClass}
          </p>
        </div>
      );
    }

    if (item.type === 'HOTEL') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = item.itemData as any;

      // Handle actual hotel data structure
      if (data.name || data.checkInDate) {
        return (
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{data.name || 'Hotel Booking'}</h4>
            {(data.location || data.address?.cityName) && (
              <p className="text-sm text-gray-600">{data.location || data.address?.cityName}</p>
            )}
            {data.checkInDate && data.checkOutDate && (
              <p className="text-xs text-gray-500">
                {new Date(data.checkInDate).toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric'
                })} - {new Date(data.checkOutDate).toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>
        );
      }

      // Fallback for typed interface structure
      const typedData = data as HotelItemData;
      return (
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{typedData.name}</h4>
          <p className="text-sm text-gray-600">{typedData.location}</p>
          <p className="text-xs text-gray-500">
            {new Date(typedData.checkInDate).toLocaleDateString()} - {new Date(typedData.checkOutDate).toLocaleDateString()}
            {' • '}
            {typedData.nights} {typedData.nights === 1 ? 'night' : 'nights'}
          </p>
        </div>
      );
    }

    if (item.type === 'ACTIVITY') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = item.itemData as any;

      // Handle both data structures
      const activityName = data.name || 'Activity Booking';
      const activityLocation = data.location?.name || data.location;
      const activityDate = data.date;
      const activityDuration = data.duration;

      return (
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{activityName}</h4>
          {activityLocation && (
            <p className="text-sm text-gray-600">{activityLocation}</p>
          )}
          {activityDate && activityDuration && (
            <p className="text-xs text-gray-500">
              {new Date(activityDate).toLocaleDateString()} • {activityDuration}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Icon */}
      <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
        {renderItemIcon()}
      </div>

      {/* Item Details */}
      {renderItemDetails()}

      <div className="flex flex-col items-end gap-2">
        {/* Price */}
        <p className="font-semibold text-gray-900">
          {item.currency} {Number(item.price).toFixed(2)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={isLoading || item.quantity <= 1}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-8 text-center font-medium text-gray-900">
            {item.quantity}
          </span>

          <button
            onClick={handleIncrement}
            disabled={isLoading}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={isLoading}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
