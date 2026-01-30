/**
 * Hotel Payment Component - Step 5
 * Final payment step with Add to Cart + Pay Now buttons
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelBookingStore } from '@/store/hotelBookingStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/services/auth/AuthService';
import {
  CreditCard,
  ShoppingCart,
  Hotel,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react';

export default function HotelPayment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const {
    selectedHotel,
    rooms,
    guests,
    contactInfo,
    checkInDate,
    checkOutDate,
    numberOfNights,
    basePrice,
    roomsTotal,
    taxesAndFees,
    getTotalPrice,
    currency,
    searchParams,
    resetBooking,
  } = useHotelBookingStore();

  const { addToCart, openDrawer, checkout } = useCartStore();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!selectedHotel) return;

    setIsAddingToCart(true);
    try {
      // Prepare complete hotel booking data
      await addToCart({
        userId: userId,
        type: 'HOTEL',
        itemId: selectedHotel.hotelId || selectedHotel.id,
        itemData: {
          ...selectedHotel,
          checkInDate,
          checkOutDate,
          numberOfNights,
          bookingDetails: {
            rooms,
            guests: guests.map((g) => ({
              ...g,
              room: rooms.find((r) => r.roomId === g.id)?.roomName,
            })),
            contactInfo,
            searchParams,
          },
          pricing: {
            basePrice,
            roomsTotal,
            taxesAndFees,
            total: getTotalPrice(),
          },
        },
        quantity: rooms.reduce((sum, r) => sum + r.quantity, 0),
        price: getTotalPrice(),
        currency,
      });

      // Open cart drawer to show added item
      openDrawer();

      // Reset booking workflow
      resetBooking();

      // Navigate back to hotels search
      setTimeout(() => {
        navigate('/hotels');
      }, 1000);
    } catch (error) {
      console.error('[HotelPayment] Failed to add to cart:', error);
      alert('Failed to add hotel to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Pay Now
  const handlePayNow = async () => {
    if (!selectedHotel) return;

    setIsProcessingPayment(true);
    try {
      // First add to cart
      await addToCart({
        userId: userId,
        type: 'HOTEL',
        itemId: selectedHotel.hotelId || selectedHotel.id,
        itemData: {
          ...selectedHotel,
          checkInDate,
          checkOutDate,
          numberOfNights,
          bookingDetails: {
            rooms,
            guests: guests.map((g) => ({
              ...g,
              room: rooms.find((r) => r.roomId === g.id)?.roomName,
            })),
            contactInfo,
            searchParams,
          },
          pricing: {
            basePrice,
            roomsTotal,
            taxesAndFees,
            total: getTotalPrice(),
          },
        },
        quantity: rooms.reduce((sum, r) => sum + r.quantity, 0),
        price: getTotalPrice(),
        currency,
      });

      // Then proceed to checkout
      const checkoutResponse = await checkout(userId);

      // Navigate to checkout page
      navigate('/checkout', {
        state: {
          checkoutData: checkoutResponse,
        },
      });

      // Reset booking workflow
      resetBooking();
    } catch (error) {
      console.error('[HotelPayment] Failed to process payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const totalRooms = rooms.reduce((sum, r) => sum + r.quantity, 0);
  const totalGuests = rooms.reduce((sum, r) => sum + r.guests.adults + r.guests.children, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Payment</h2>

      {/* Hotel Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Hotel className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Hotel Details</h3>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-gray-900 text-xl">{selectedHotel?.name}</p>
            <p className="text-sm text-gray-600">{selectedHotel?.chainCode}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-in</p>
              <p className="font-semibold text-gray-900">
                {checkInDate ? new Date(checkInDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-out</p>
              <p className="font-semibold text-gray-900">
                {checkOutDate ? new Date(checkOutDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-semibold text-gray-900">
                {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Rooms & Guests</p>
              <p className="font-semibold text-gray-900">
                {totalRooms} {totalRooms === 1 ? 'room' : 'rooms'}, {totalGuests}{' '}
                {totalGuests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Room Selection</h3>
        </div>

        <div className="space-y-3">
          {rooms.map((room, index) => (
            <div
              key={room.roomId}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {index + 1}. {room.roomName || room.roomType}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {room.bedType} • {room.guests.adults} adults
                  {room.guests.children > 0 && `, ${room.guests.children} children`}
                </p>
                {room.amenities && room.amenities.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {room.amenities.slice(0, 3).join(' • ')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {currency} {(room.price * room.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  x{room.quantity} {room.quantity === 1 ? 'room' : 'rooms'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guests Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Guests ({guests.length})
          </h3>
        </div>

        <div className="space-y-2">
          {guests.map((guest, index) => (
            <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-900">
                {index + 1}. {guest.title} {guest.firstName} {guest.lastName}
                {guest.type === 'primary' && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </p>
              {guest.email && (
                <p className="text-sm text-gray-600">{guest.email}</p>
              )}
            </div>
          ))}
        </div>

        {contactInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-1">Contact Information</p>
            <p className="text-sm text-gray-600">{contactInfo.email}</p>
            <p className="text-sm text-gray-600">{contactInfo.phone}</p>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg p-6 border-2 border-orange-300 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">
              Room Total ({totalRooms} {totalRooms === 1 ? 'room' : 'rooms'} x {numberOfNights}{' '}
              {numberOfNights === 1 ? 'night' : 'nights'})
            </span>
            <span className="font-medium text-gray-900">
              {currency} {roomsTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Taxes & Fees</span>
            <span className="font-medium text-gray-900">
              {currency} {taxesAndFees.toFixed(2)}
            </span>
          </div>

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
