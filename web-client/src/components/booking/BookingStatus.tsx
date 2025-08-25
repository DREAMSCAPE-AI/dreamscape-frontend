import React from 'react';
import { Check, Clock, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface BookingStatusProps {
  booking: Booking;
  onRebook?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

interface Booking {
  id: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'failed';
  type: 'flight' | 'hotel' | 'experience';
  details: {
    title: string;
    date: string;
    reference: string;
  };
  updates: {
    timestamp: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }[];
}

const BookingStatus: React.FC<BookingStatusProps> = ({
  booking,
  onRebook,
  onCancel
}) => {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-500 bg-green-50';
      case 'pending': return 'text-orange-500 bg-orange-50';
      case 'cancelled': return 'text-red-500 bg-red-50';
      case 'failed': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return Check;
      case 'pending': return Clock;
      case 'cancelled': return X;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(booking.status);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{booking.details.title}</h3>
              <p className="text-sm text-gray-600">Ref: {booking.details.reference}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {booking.status === 'failed' && onRebook && (
              <button
                onClick={() => onRebook(booking)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rebook</span>
              </button>
            )}
            {booking.status === 'pending' && onCancel && (
              <button
                onClick={() => onCancel(booking)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-4">
          {booking.updates.map((update, index) => (
            <div key={index} className="flex gap-4">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  update.type === 'success' ? 'bg-green-500' :
                  update.type === 'warning' ? 'bg-orange-500' :
                  update.type === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                {index < booking.updates.length - 1 && (
                  <div className="absolute top-3 left-1.5 bottom-0 w-px bg-gray-200" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="text-sm text-gray-500">
                  {new Date(update.timestamp).toLocaleString()}
                </div>
                <div className="mt-1">{update.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;