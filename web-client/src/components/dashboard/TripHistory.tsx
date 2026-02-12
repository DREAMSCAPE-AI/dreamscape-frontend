import React from 'react';
import { History, Calendar, MapPin, RefreshCw, Plane, Hotel, Car, MapPin as Activity, Star } from 'lucide-react';
import { Booking } from '../../services/dashboardService';
import { useTranslation } from 'react-i18next';

interface TripHistoryProps {
  bookings: Booking[];
  onRefresh: () => Promise<void>;
}

const TripHistory: React.FC<TripHistoryProps> = ({ bookings, onRefresh }) => {
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

  // Filter for completed trips (past dates)
  const completedBookings = bookings.filter(booking => {
    const departureDate = new Date(booking.departureDate);
    return departureDate < new Date() && booking.status === 'confirmed';
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-orange-500" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">{t('tripHistory.title')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title={t('tripHistory.refreshHistory')}
            aria-label={t('tripHistory.refreshHistory')}
          >
            <RefreshCw className="w-4 h-4 flex-shrink-0" />
          </button>
          <button
            className="hidden sm:block min-h-[44px] px-3 text-sm md:text-base text-orange-500 hover:text-orange-600 transition-colors"
            aria-label={t('tripHistory.viewAll')}
          >
            {t('tripHistory.viewAll')}
          </button>
        </div>
      </div>

      {completedBookings.length > 0 ? (
        <div className="space-y-3 md:space-y-4">
          {completedBookings.slice(0, 3).map((booking) => {
            const TypeIcon = getTypeIcon(booking.type);
            return (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0">
                      <TypeIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1 truncate">
                        {booking.destination}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{formatDate(booking.departureDate)}</span>
                          {booking.returnDate && (
                            <>
                              <span>-</span>
                              <span className="truncate">{formatDate(booking.returnDate)}</span>
                            </>
                          )}
                        </div>
                        <span className="capitalize text-xs md:text-sm">{booking.type}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className="text-xs md:text-sm font-semibold text-gray-800">
                          ${booking.totalAmount} {booking.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] text-xs md:text-sm text-orange-500 hover:bg-orange-50 rounded-lg transition-colors w-full sm:w-auto"
                    aria-label={t('tripHistory.rate')}
                  >
                    <Star className="w-4 h-4 flex-shrink-0" />
                    <span>{t('tripHistory.rate')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 md:py-8">
          <History className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm md:text-base text-gray-500">{t('tripHistory.noTrips')}</p>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {t('tripHistory.noTripsHint')}
          </p>
        </div>
      )}

      {completedBookings.length > 3 && (
        <div className="mt-4 md:mt-6 text-center">
          <button
            className="px-4 md:px-6 py-2.5 min-h-[48px] text-sm md:text-base font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            aria-label={t('tripHistory.viewAllCount', { count: completedBookings.length })}
          >
            {t('tripHistory.viewAllCount', { count: completedBookings.length })}
          </button>
        </div>
      )}

      {completedBookings.length > 0 && (
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-gray-600">{t('tripHistory.totalCompleted')}</span>
            <span className="font-semibold text-gray-800">{completedBookings.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs md:text-sm mt-1">
            <span className="text-gray-600">{t('tripHistory.totalSpent')}</span>
            <span className="font-semibold text-gray-800">
              ${completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;