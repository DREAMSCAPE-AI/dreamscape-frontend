/**
 * Flight Payment Component - Step 7
 * Final payment step with Add to Cart + Pay Now buttons
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightBookingStore } from '@/store/flightBookingStore';
import { useCartStore } from '@/store/cartStore';
import {
  CreditCard,
  ShoppingCart,
  Check,
  Plane,
  User,
  Utensils,
  Luggage,
  Armchair,
} from 'lucide-react';

// TODO: Replace with actual user ID from auth store
const TEMP_USER_ID = 'user-123';

export default function FlightPayment() {
  const navigate = useNavigate();
  const {
    selectedFlight,
    passengers,
    seats,
    meals,
    baggage,
    basePrice,
    seatsTotal,
    mealsTotal,
    baggageTotal,
    getTotalPrice,
    currency,
    searchParams,
    resetBooking,
  } = useFlightBookingStore();

  const { addToCart, openDrawer, checkout } = useCartStore();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!selectedFlight) return;

    setIsAddingToCart(true);
    try {
      // Prepare complete flight booking data
      await addToCart(TEMP_USER_ID, {
        type: 'FLIGHT',
        itemId: selectedFlight.id,
        itemData: {
          // Flight details
          ...selectedFlight,
          origin: selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode,
          destination:
            selectedFlight.itineraries?.[0]?.segments?.[
              selectedFlight.itineraries[0].segments.length - 1
            ]?.arrival?.iataCode,
          departureDate: selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at,
          arrivalDate:
            selectedFlight.itineraries?.[0]?.segments?.[
              selectedFlight.itineraries[0].segments.length - 1
            ]?.arrival?.at,

          // Booking details
          bookingDetails: {
            passengers: passengers.map((p) => ({
              ...p,
              seat: seats.find((s) => s.passengerId === p.id)?.seatNumber,
              meal: meals.find((m) => m.passengerId === p.id)?.mealName,
              baggage: baggage.filter((b) => b.passengerId === p.id),
            })),
            seats,
            meals,
            baggage,
            searchParams,
          },

          // Pricing breakdown
          pricing: {
            basePrice,
            seatsTotal,
            mealsTotal,
            baggageTotal,
            total: getTotalPrice(),
          },
        },
        quantity: passengers.length,
        price: getTotalPrice(),
        currency,
      });

      // Open cart drawer to show added item
      openDrawer();

      // Reset booking workflow
      resetBooking();

      // Navigate back to flights search
      setTimeout(() => {
        navigate('/flights');
      }, 1000);
    } catch (error) {
      console.error('[FlightPayment] Failed to add to cart:', error);
      alert('Failed to add flight to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Pay Now
  const handlePayNow = async () => {
    if (!selectedFlight) return;

    setIsProcessingPayment(true);
    try {
      // First add to cart
      await addToCart(TEMP_USER_ID, {
        type: 'FLIGHT',
        itemId: selectedFlight.id,
        itemData: {
          ...selectedFlight,
          origin: selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode,
          destination:
            selectedFlight.itineraries?.[0]?.segments?.[
              selectedFlight.itineraries[0].segments.length - 1
            ]?.arrival?.iataCode,
          departureDate: selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at,
          arrivalDate:
            selectedFlight.itineraries?.[0]?.segments?.[
              selectedFlight.itineraries[0].segments.length - 1
            ]?.arrival?.at,
          bookingDetails: {
            passengers: passengers.map((p) => ({
              ...p,
              seat: seats.find((s) => s.passengerId === p.id)?.seatNumber,
              meal: meals.find((m) => m.passengerId === p.id)?.mealName,
              baggage: baggage.filter((b) => b.passengerId === p.id),
            })),
            seats,
            meals,
            baggage,
            searchParams,
          },
          pricing: {
            basePrice,
            seatsTotal,
            mealsTotal,
            baggageTotal,
            total: getTotalPrice(),
          },
        },
        quantity: passengers.length,
        price: getTotalPrice(),
        currency,
      });

      // Then proceed to checkout
      const checkoutResponse = await checkout(TEMP_USER_ID);

      // Navigate to checkout page
      navigate('/checkout', {
        state: {
          checkoutData: checkoutResponse,
        },
      });

      // Reset booking workflow
      resetBooking();
    } catch (error) {
      console.error('[FlightPayment] Failed to process payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const itinerary = selectedFlight?.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Payment</h2>

      {/* Flight Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Plane className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Flight Details</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Departure</p>
            <p className="font-semibold text-gray-900">
              {firstSegment?.departure?.iataCode} →{' '}
              {lastSegment?.arrival?.iataCode}
            </p>
            <p className="text-sm text-gray-600">
              {firstSegment?.departure?.at
                ? new Date(firstSegment.departure.at).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Airline</p>
            <p className="font-semibold text-gray-900">
              {selectedFlight?.validatingAirlineCodes?.[0] || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              {segments.length > 1 ? `${segments.length} stops` : 'Direct flight'}
            </p>
          </div>
        </div>
      </div>

      {/* Passengers Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Passengers ({passengers.length})
          </h3>
        </div>

        <div className="space-y-3">
          {passengers.map((passenger, index) => {
            const passengerSeat = seats.find((s) => s.passengerId === passenger.id);
            const passengerMeal = meals.find((m) => m.passengerId === passenger.id);
            const passengerBaggage = baggage.filter((b) => b.passengerId === passenger.id);

            return (
              <div
                key={passenger.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {index + 1}. {passenger.title} {passenger.firstName} {passenger.lastName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    {passengerSeat && (
                      <div className="flex items-center gap-1">
                        <Armchair className="w-4 h-4" />
                        <span>Seat {passengerSeat.seatNumber}</span>
                      </div>
                    )}
                    {passengerMeal && (
                      <div className="flex items-center gap-1">
                        <Utensils className="w-4 h-4" />
                        <span>{passengerMeal.mealName}</span>
                      </div>
                    )}
                    {passengerBaggage.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Luggage className="w-4 h-4" />
                        <span>{passengerBaggage.length} bag(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg p-6 border-2 border-orange-300 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Base Fare ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
            <span className="font-medium text-gray-900">
              {currency} {basePrice.toFixed(2)}
            </span>
          </div>

          {seatsTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                Seat Selection ({seats.length} seat{seats.length > 1 ? 's' : ''})
              </span>
              <span className="font-medium text-gray-900">
                {currency} {seatsTotal.toFixed(2)}
              </span>
            </div>
          )}

          {mealsTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                Meals ({meals.length} meal{meals.length > 1 ? 's' : ''})
              </span>
              <span className="font-medium text-gray-900">
                {currency} {mealsTotal.toFixed(2)}
              </span>
            </div>
          )}

          {baggageTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                Baggage ({baggage.reduce((sum, b) => sum + b.quantity, 0)} bag
                {baggage.reduce((sum, b) => sum + b.quantity, 0) > 1 ? 's' : ''})
              </span>
              <span className="font-medium text-gray-900">
                {currency} {baggageTotal.toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t-2 border-gray-300 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                {currency} {getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || isProcessingPayment}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 border-2 ${
            isAddingToCart || isProcessingPayment
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
              : 'bg-white border-orange-500 text-orange-500 hover:bg-orange-50'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
        </button>

        {/* Pay Now Button */}
        <button
          onClick={handlePayNow}
          disabled={isAddingToCart || isProcessingPayment}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 ${
            isAddingToCart || isProcessingPayment
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          {isProcessingPayment ? 'Processing...' : `Pay Now - ${currency} ${getTotalPrice().toFixed(2)}`}
        </button>
      </div>

      {/* Terms & Conditions */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By proceeding, you agree to our{' '}
          <a href="/terms" className="text-orange-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-orange-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
