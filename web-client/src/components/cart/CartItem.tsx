/**
 * CartItem - Individual cart item component
 * Displays item details with quantity controls and remove button
 */

import { Minus, Plus, Trash2, Plane, Hotel, MapPin } from 'lucide-react';
import type { CartItem as CartItemType, FlightItemData, HotelItemData, ActivityItemData } from '@/types/cart';

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
    if (item.type === 'FLIGHT') {
      const data = item.itemData as FlightItemData;
      return (
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{data.airline} {data.flightNumber}</h4>
          <p className="text-sm text-gray-600">
            {data.origin} → {data.destination}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(data.departureTime).toLocaleDateString()} • {data.cabinClass}
          </p>
        </div>
      );
    }

    if (item.type === 'HOTEL') {
      const data = item.itemData as HotelItemData;
      return (
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{data.name}</h4>
          <p className="text-sm text-gray-600">{data.location}</p>
          <p className="text-xs text-gray-500">
            {new Date(data.checkInDate).toLocaleDateString()} - {new Date(data.checkOutDate).toLocaleDateString()}
            {' • '}
            {data.nights} {data.nights === 1 ? 'night' : 'nights'}
          </p>
        </div>
      );
    }

    if (item.type === 'ACTIVITY') {
      const data = item.itemData as ActivityItemData;
      return (
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{data.name}</h4>
          <p className="text-sm text-gray-600">{data.location}</p>
          <p className="text-xs text-gray-500">
            {new Date(data.date).toLocaleDateString()} • {data.duration}
          </p>
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
