/**
 * CartItem - Individual cart item component
 * Displays item details with quantity controls and remove button
 */

import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2, Plane, Hotel, MapPin } from 'lucide-react';
import type { CartItem as CartItemType, FlightItemData, HotelItemData } from '@/types/cart';
import { getAirportInfo } from '@/utils/airportCodes';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isLoading?: boolean;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove, isLoading }: CartItemProps) => {
  const { t } = useTranslation('checkout');

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

      // Extract origin/destination with multiple fallbacks
      const originCode = data.origin || data.departure?.iataCode || '';
      const destinationCode = data.destination || data.arrival?.iataCode || '';
      const departureDateTime = data.departureDate || data.departureTime || data.departure?.at || '';
      const carrier = data.validatingAirlineCodes?.[0] || data.carrierCode || data.airline || '';
      const flightNum = data.flightNumber || data.number || '';

      // Get city names from airport codes
      const originInfo = getAirportInfo(originCode);
      const destinationInfo = getAirportInfo(destinationCode);

      // Display flight info with extracted data
      if (originCode || destinationCode) {
        return (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-center">
                <span className="font-bold text-gray-900">{originCode || '---'}</span>
                {originInfo && (
                  <p className="text-xs text-gray-500">{originInfo.city}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="text-center">
                <span className="font-bold text-gray-900">{destinationCode || '---'}</span>
                {destinationInfo && (
                  <p className="text-xs text-gray-500">{destinationInfo.city}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">
              {departureDateTime ? new Date(departureDateTime).toLocaleDateString('fr-FR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : ''}
            </p>
            <p className="text-xs text-gray-500">
              {carrier}{flightNum ? ` ${flightNum}` : ''}{carrier || flightNum ? '' : t('cart.item.flight', 'Flight')}
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
            <h4 className="font-semibold text-gray-900">{data.name || t('cart.item.hotelBooking', 'Hotel Booking')}</h4>
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
            {typedData.nights} {typedData.nights === 1 ? t('cart.item.night', 'night') : t('cart.item.nights', 'nights')}
          </p>
        </div>
      );
    }

    if (item.type === 'ACTIVITY') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = item.itemData as any;

      // Handle both data structures
      const activityName = data.name || t('cart.item.activityBooking', 'Activity Booking');
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
    <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Icon */}
      <div className="flex-shrink-0 p-1.5 md:p-2 bg-gray-50 rounded-lg">
        {renderItemIcon()}
      </div>

      {/* Item Details */}
      {renderItemDetails()}

      <div className="flex flex-col items-end gap-1.5 md:gap-2">
        {/* Price */}
        <p className="font-semibold text-gray-900 text-sm md:text-base whitespace-nowrap">
          {item.currency} {Number(item.price).toFixed(2)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={handleDecrement}
            disabled={isLoading || item.quantity <= 1}
            className="p-2 min-h-[36px] min-w-[36px] md:min-h-[40px] md:min-w-[40px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label={t('cart.item.decrease', 'Decrease quantity')}
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-6 md:w-8 text-center font-medium text-gray-900 text-sm">
            {item.quantity}
          </span>

          <button
            onClick={handleIncrement}
            disabled={isLoading}
            className="p-2 min-h-[36px] min-w-[36px] md:min-h-[40px] md:min-w-[40px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label={t('cart.item.increase', 'Increase quantity')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={isLoading}
          className="p-2 min-h-[36px] min-w-[36px] md:min-h-[40px] md:min-w-[40px] text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label={t('cart.item.remove', 'Remove item')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
