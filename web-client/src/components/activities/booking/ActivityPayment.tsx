/**
 * Activity Payment Component - Step 4
 * Final payment step with Add to Cart + Pay Now buttons
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivityBookingStore } from '@/store/activityBookingStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/services/auth/AuthService';
import {
  CreditCard,
  ShoppingCart,
  MapPin,
  Calendar,
  Clock,
  Users,
  User,
  Star,
} from 'lucide-react';

export default function ActivityPayment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const {
    selectedActivity,
    participants,
    numberOfParticipants,
    selectedDate,
    selectedTime,
    basePrice,
    getTotalPrice,
    currency,
    searchParams,
    contactInfo,
    resetBooking,
  } = useActivityBookingStore();

  const { addToCart, openDrawer, checkout } = useCartStore();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!selectedActivity) return;

    setIsAddingToCart(true);
    try {
      // Prepare complete activity booking data
      await addToCart({
        userId: userId,
        type: 'ACTIVITY',
        itemId: selectedActivity.id,
        itemData: {
          // Core activity data matching ActivityItemData interface
          type: 'activity',
          name: selectedActivity.name,
          location: selectedActivity.location?.name || '',
          date: selectedDate,
          duration: selectedActivity.duration,
          participants: numberOfParticipants,
          description: selectedActivity.description,
          imageUrl: selectedActivity.images?.[0],

          // Extended booking details
          category: selectedActivity.category,
          bookingDetails: {
            participants: participants,
            numberOfParticipants,
            selectedDate,
            selectedTime,
            contactInfo,
            searchParams,
          },

          // Pricing breakdown
          pricing: {
            basePrice,
            numberOfParticipants,
            total: getTotalPrice(),
          },
        },
        quantity: numberOfParticipants,
        price: getTotalPrice(),
        currency,
      });

      // Open cart drawer to show added item
      openDrawer();

      // Reset booking workflow
      resetBooking();

      // Navigate back to activities search
      setTimeout(() => {
        navigate('/activities');
      }, 1000);
    } catch (error) {
      console.error('[ActivityPayment] Failed to add to cart:', error);
      alert('Failed to add activity to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Pay Now
  const handlePayNow = async () => {
    if (!selectedActivity) return;

    setIsProcessingPayment(true);
    try {
      // First add to cart
      await addToCart({
        userId: userId,
        type: 'ACTIVITY',
        itemId: selectedActivity.id,
        itemData: {
          // Core activity data matching ActivityItemData interface
          type: 'activity',
          name: selectedActivity.name,
          location: selectedActivity.location?.name || '',
          date: selectedDate,
          duration: selectedActivity.duration,
          participants: numberOfParticipants,
          description: selectedActivity.description,
          imageUrl: selectedActivity.images?.[0],

          // Extended booking details
          category: selectedActivity.category,
          bookingDetails: {
            participants: participants,
            numberOfParticipants,
            selectedDate,
            selectedTime,
            contactInfo,
            searchParams,
          },
          pricing: {
            basePrice,
            numberOfParticipants,
            total: getTotalPrice(),
          },
        },
        quantity: numberOfParticipants,
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
      console.error('[ActivityPayment] Failed to process payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Payment</h2>

      {/* Activity Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200 mb-6">
        <div className="flex items-start gap-4">
          {selectedActivity?.images?.[0] && (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={selectedActivity.images[0]}
                alt={selectedActivity.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                {selectedActivity?.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedActivity?.name}
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{selectedActivity?.location?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{selectedActivity?.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>
                  {selectedActivity?.rating?.toFixed(1)} ({selectedActivity?.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium text-gray-900">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not selected'}
              </p>
            </div>
          </div>

          {selectedTime && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">{selectedTime}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="font-medium text-gray-900">
                {numberOfParticipants} {numberOfParticipants === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Summary */}
      {participants.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Participants ({participants.length})
            </h3>
          </div>

          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {index + 1}. {participant.title} {participant.firstName} {participant.lastName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {participant.type.charAt(0).toUpperCase() + participant.type.slice(1)}
                  </p>
                  {participant.specialRequirements && (
                    <p className="text-xs text-gray-500 mt-1">
                      Special requirements: {participant.specialRequirements}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {contactInfo && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{contactInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{contactInfo.phone}</span>
            </div>
            {contactInfo.emergencyContact && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-600 mb-1">Emergency Contact:</p>
                <p className="font-medium text-gray-900">{contactInfo.emergencyContact.name}</p>
                <p className="text-gray-600">{contactInfo.emergencyContact.phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg p-6 border-2 border-orange-300 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">
              Price per person
            </span>
            <span className="font-medium text-gray-900">
              {currency} {basePrice.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">
              Number of participants
            </span>
            <span className="font-medium text-gray-900">× {numberOfParticipants}</span>
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

      {/* Booking Policy */}
      {selectedActivity?.bookingInfo && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
          <div className="space-y-2 text-sm text-gray-700">
            {selectedActivity.bookingInfo.instantConfirmation && (
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Instant confirmation
              </p>
            )}
            {selectedActivity.bookingInfo.freeCancellation && (
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {selectedActivity.bookingInfo.cancellationPolicy}
              </p>
            )}
          </div>
        </div>
      )}

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
