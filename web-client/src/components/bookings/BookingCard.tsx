import React from 'react';
import {
  Plane,
  Hotel,
  Calendar,
  MapPin,
  Clock,
  Check,
  X,
  AlertTriangle,
  CreditCard,
  Package,
  ChevronRight,
  Ban,
} from 'lucide-react';

export type BookingStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
export type BookingType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'PACKAGE' | 'TRANSFER';

export interface BookingItem {
  type: string;
  itemId: string;
  itemData: any;
  quantity: number;
  price: number;
  currency: string;
}

export interface Booking {
  id: string;
  reference: string;
  type: BookingType;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  items: BookingItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
}

interface BookingCardProps {
  booking: Booking;
  onViewDetails?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
  onCancel,
}) => {
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          label: 'Confirmee',
          color: 'text-green-600 bg-green-100',
          icon: Check,
        };
      case 'COMPLETED':
        return {
          label: 'Terminee',
          color: 'text-blue-600 bg-blue-100',
          icon: Check,
        };
      case 'PENDING':
        return {
          label: 'En attente',
          color: 'text-yellow-600 bg-yellow-100',
          icon: Clock,
        };
      case 'PENDING_PAYMENT':
        return {
          label: 'Paiement en attente',
          color: 'text-orange-600 bg-orange-100',
          icon: CreditCard,
        };
      case 'DRAFT':
        return {
          label: 'Brouillon',
          color: 'text-gray-600 bg-gray-100',
          icon: Clock,
        };
      case 'CANCELLED':
        return {
          label: 'Annulee',
          color: 'text-red-600 bg-red-100',
          icon: X,
        };
      case 'FAILED':
        return {
          label: 'Echouee',
          color: 'text-red-600 bg-red-100',
          icon: AlertTriangle,
        };
      default:
        return {
          label: status,
          color: 'text-gray-600 bg-gray-100',
          icon: Clock,
        };
    }
  };

  const getTypeConfig = (type: BookingType) => {
    switch (type) {
      case 'FLIGHT':
        return {
          label: 'Vol',
          icon: Plane,
          color: 'text-blue-500',
        };
      case 'HOTEL':
        return {
          label: 'Hotel',
          icon: Hotel,
          color: 'text-purple-500',
        };
      case 'ACTIVITY':
        return {
          label: 'Activite',
          icon: Calendar,
          color: 'text-orange-500',
        };
      case 'PACKAGE':
        return {
          label: 'Package',
          icon: Package,
          color: 'text-green-500',
        };
      case 'TRANSFER':
        return {
          label: 'Transfert',
          icon: MapPin,
          color: 'text-cyan-500',
        };
      default:
        return {
          label: type,
          icon: Package,
          color: 'text-gray-500',
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getBookingTitle = () => {
    if (booking.items.length === 0) {
      return `Reservation ${booking.type.toLowerCase()}`;
    }

    const firstItem = booking.items[0];
    if (firstItem.itemData?.name) {
      return firstItem.itemData.name;
    }
    if (firstItem.itemData?.hotelName) {
      return firstItem.itemData.hotelName;
    }
    if (firstItem.itemData?.itineraries?.[0]?.segments?.[0]) {
      const segment = firstItem.itemData.itineraries[0].segments[0];
      return `${segment.departure?.iataCode || 'DEP'} → ${segment.arrival?.iataCode || 'ARR'}`;
    }
    return `Reservation #${booking.reference}`;
  };

  const getBookingSubtitle = () => {
    if (booking.items.length === 0) {
      return null;
    }

    const firstItem = booking.items[0];
    if (firstItem.itemData?.location?.name) {
      return firstItem.itemData.location.name;
    }
    if (firstItem.itemData?.cityName) {
      return firstItem.itemData.cityName;
    }
    if (firstItem.itemData?.address?.cityName) {
      return firstItem.itemData.address.cityName;
    }
    return null;
  };

  const statusConfig = getStatusConfig(booking.status);
  const typeConfig = getTypeConfig(booking.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  const canCancel = ['DRAFT', 'PENDING_PAYMENT', 'PENDING', 'CONFIRMED'].includes(booking.status);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="p-4 sm:p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Type Icon */}
            <div className={`p-2 sm:p-3 rounded-lg bg-gray-50 ${typeConfig.color}`}>
              <TypeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Booking Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {getBookingTitle()}
              </h3>
              {getBookingSubtitle() && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {getBookingSubtitle()}
                </p>
              )}
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Ref: {booking.reference}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${statusConfig.color} whitespace-nowrap`}>
            <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{statusConfig.label}</span>
          </div>
        </div>

        {/* Details Row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(booking.createdAt)}</span>
          </div>
          {booking.itemCount > 1 && (
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-gray-400" />
              <span>{booking.itemCount} elements</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Footer Row */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          {/* Price */}
          <div>
            <span className="text-xs text-gray-500">Total</span>
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              {formatPrice(booking.totalAmount, booking.currency)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(booking);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Ban className="w-4 h-4" />
                <span className="hidden sm:inline">Annuler</span>
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(booking)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <span>Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
