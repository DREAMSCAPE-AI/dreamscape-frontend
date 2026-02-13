import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Calendar, MapPin, RefreshCw, Plane, Hotel, Car, MapPin as Activity } from 'lucide-react';
import { Booking } from '@/services/dashboard';

interface SavedItinerariesProps {
  bookings: Booking[];
  onRefresh: () => Promise<void>;
}

const SavedItineraries: React.FC<SavedItinerariesProps> = ({ bookings, onRefresh }) => {
  const { t, i18n } = useTranslation('dashboard');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Hotel;
      case 'transfer':
        return Car;
      case 'activity':
        return Activity;
      default:
        return MapPin;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-800">{t('savedItineraries.title')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title={t('savedItineraries.refreshBookings')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="text-orange-500 hover:text-orange-600 transition-colors">
            {t('savedItineraries.viewAll')}
          </button>
        </div>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.slice(0, 3).map((booking) => {
            const TypeIcon = getTypeIcon(booking.type);
            return (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <TypeIcon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {booking.destination}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.departureDate)}</span>
                          {booking.returnDate && (
                            <>
                              <span>-</span>
                              <span>{formatDate(booking.returnDate)}</span>
                            </>
                          )}
                        </div>
                        <span className="capitalize">{booking.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          ${booking.totalAmount} {booking.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('savedItineraries.noItineraries')}</p>
          <p className="text-gray-400 text-sm mt-1">
            {t('savedItineraries.noItinerariesHint')}
          </p>
        </div>
      )}

      {bookings.length > 3 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            {t('savedItineraries.viewAllCount', { count: bookings.length })}
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedItineraries;