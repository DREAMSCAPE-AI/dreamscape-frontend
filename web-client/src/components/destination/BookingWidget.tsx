import React, { useState } from 'react';
import { Calendar, Users, ArrowRight, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DateRangePicker from '../shared/DateRangePicker';

interface BookingWidgetProps {
  price: {
    from: number;
    currency: string;
  };
  rating: number;
  reviewCount: number;
  location: string;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ price, rating, reviewCount, location }) => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState(2);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [bookingType, setBookingType] = useState<'stay' | 'flight'>('stay');

  const handleBookFlight = () => {
    navigate('/flights', {
      state: {
        destination: location,
        dates: dateRange,
        passengers: guests
      }
    });
  };

  const handleBookStay = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      // Show error or prompt user to select dates
      return;
    }

    navigate('/planner', {
      state: {
        dates: dateRange,
        guests,
        price: price.from,
        currency: price.currency,
        type: 'new'
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-2xl font-bold">{price.currency}{price.from}</span>
          <span className="text-gray-500"> /night</span>
        </div>
        <div className="text-sm text-gray-600">
          {rating} • {reviewCount} reviews
        </div>
      </div>

      {/* Booking Type Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setBookingType('stay')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            bookingType === 'stay'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Book Stay
        </button>
        <button
          onClick={() => setBookingType('flight')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            bookingType === 'flight'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Book Flight
        </button>
      </div>

      <div className="space-y-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {bookingType === 'stay' ? 'Stay Dates' : 'Flight Dates'}
          </label>
          <DateRangePicker
            onChange={setDateRange}
            value={dateRange}
            minDate={new Date()}
          />
        </div>

        {/* Guests/Passengers Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {bookingType === 'stay' ? 'Guests' : 'Passengers'}
          </label>
          <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
            <Users className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-transparent outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? (bookingType === 'stay' ? 'guest' : 'passenger') : (bookingType === 'stay' ? 'guests' : 'passengers')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={bookingType === 'stay' ? handleBookStay : handleBookFlight}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {bookingType === 'stay' ? (
            <>
              <span>Book Your Stay</span>
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              <Plane className="w-5 h-5" />
              <span>Search Flights</span>
            </>
          )}
        </button>

        {/* Price Breakdown */}
        {bookingType === 'stay' && dateRange.startDate && dateRange.endDate && (
          <div className="mt-6 space-y-2 pt-6 border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>3 nights</span>
              <span>{price.currency}{price.from * 3}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service fee</span>
              <span>{price.currency}50</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{price.currency}{price.from * 3 + 50}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;