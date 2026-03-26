import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, RefreshCw, Plane, Hotel, Car, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Booking } from '@/services/dashboard';

interface SavedItinerariesProps {
  bookings: Booking[];
  onRefresh: () => Promise<void>;
}

const SavedItineraries: React.FC<SavedItinerariesProps> = ({ bookings, onRefresh }) => {
  const { t, i18n } = useTranslation('dashboard');
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const displayedBookings = showAll ? bookings : bookings.slice(0, 3);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'transfer': return Car;
      default: return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight': return 'border-l-orange-500 bg-orange-500';
      case 'hotel': return 'border-l-blue-500 bg-blue-500';
      case 'activity': return 'border-l-emerald-500 bg-emerald-500';
      default: return 'border-l-gray-400 bg-gray-400';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold tracking-tight text-surface-900">{t('savedItineraries.title')}</h2>
          {bookings.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-surface-100 text-gray-500 rounded-full">
              {bookings.length}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
          aria-label={t('savedItineraries.refreshBookings')}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-3">
          {displayedBookings.map((booking, index) => {
            const TypeIcon = getTypeIcon(booking.type);
            const typeColor = getTypeColor(booking.type);
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/bookings/${booking.id}`)}
                className={`relative border-l-[3px] ${typeColor.split(' ')[0]} rounded-xl bg-surface-50/50 hover:bg-surface-100/80 p-4 cursor-pointer transition-colors group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TypeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="text-sm font-bold tracking-tight text-surface-900 truncate">
                        {booking.destination}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(booking.departureDate)}
                        {booking.returnDate && ` — ${formatDate(booking.returnDate)}`}
                      </span>
                      <span className="capitalize">{booking.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold text-surface-900">
                      ${booking.totalAmount}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(booking.status)}`} />
                      <span className="text-xs text-gray-400 capitalize">{booking.status}</span>
                    </div>
                  </div>
                </div>

                {/* Hover arrow */}
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface-100 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('savedItineraries.noItineraries')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('savedItineraries.noItinerariesHint')}</p>
        </div>
      )}

      {bookings.length > 3 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2.5 text-sm font-medium text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors flex items-center justify-center gap-2"
          aria-label={t('savedItineraries.viewAllCount', { count: bookings.length })}
        >
          {showAll ? t('savedItineraries.showLess') : t('savedItineraries.viewAllCount', { count: bookings.length })}
          <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </motion.button>
      )}
    </div>
  );
};

export default SavedItineraries;
