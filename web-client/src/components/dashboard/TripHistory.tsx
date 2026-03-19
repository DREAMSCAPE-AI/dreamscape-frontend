import React, { useState } from 'react';
import { History, Calendar, Plane, Hotel, Car, MapPin, Star, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Booking } from '@/services/dashboard';
import { useTranslation } from 'react-i18next';

interface TripHistoryProps {
  bookings: Booking[];
  onRefresh: () => Promise<void>;
}

const TripHistory: React.FC<TripHistoryProps> = ({ bookings, onRefresh }) => {
  const { t, i18n } = useTranslation('dashboard');
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRate = (bookingId: string) => {
    setRatings(prev => ({
      ...prev,
      [bookingId]: (prev[bookingId] || 0) < 5 ? (prev[bookingId] || 0) + 1 : 0
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'transfer': return Car;
      default: return MapPin;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const completedBookings = bookings.filter(booking => {
    const departureDate = new Date(booking.departureDate);
    return departureDate < new Date() && booking.status === 'confirmed';
  });

  const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold tracking-tight text-surface-900">{t('tripHistory.title')}</h2>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
          aria-label={t('tripHistory.refreshHistory')}
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Summary stats row */}
      {completedBookings.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-50 rounded-xl">
            <div className="p-2 bg-gradient-to-br from-orange-500/15 to-pink-500/15 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('tripHistory.totalCompleted')}</p>
              <p className="text-lg font-bold tracking-tight text-surface-900">{completedBookings.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-50 rounded-xl">
            <div className="p-2 bg-gradient-to-br from-orange-500/15 to-pink-500/15 rounded-lg">
              <DollarSign className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('tripHistory.totalSpent')}</p>
              <p className="text-lg font-bold tracking-tight text-surface-900">${totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {completedBookings.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-surface-200/80" />

          <div className="space-y-4">
            {completedBookings.slice(0, 3).map((booking, index) => {
              const TypeIcon = getTypeIcon(booking.type);
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex gap-4 pl-9"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[11px] top-1 w-[9px] h-[9px] rounded-full bg-orange-500 ring-2 ring-white" />

                  {/* Content */}
                  <div className="flex-1 flex items-center justify-between gap-3 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-surface-100 rounded-lg flex-shrink-0">
                        <TypeIcon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight text-surface-900 truncate">{booking.destination}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(booking.departureDate)}
                          <span className="text-gray-300 mx-0.5">·</span>
                          <span className="capitalize">{booking.type}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-surface-900">${booking.totalAmount}</span>
                      <button
                        onClick={() => handleRate(booking.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          ratings[booking.id] ? 'text-amber-500 bg-amber-50' : 'text-orange-500 hover:bg-orange-50'
                        }`}
                        aria-label={t('tripHistory.rate')}
                      >
                        <Star className={`w-3.5 h-3.5 ${ratings[booking.id] ? 'fill-amber-500' : ''}`} />
                        <span className="hidden sm:inline">{ratings[booking.id] ? `${ratings[booking.id]}/5` : t('tripHistory.rate')}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface-100 flex items-center justify-center">
            <History className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('tripHistory.noTrips')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('tripHistory.noTripsHint')}</p>
        </div>
      )}
    </div>
  );
};

export default TripHistory;
