/**
 * Stripe Checkout Form Component
 * Handles payment submission using Stripe Elements
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/services/auth/AuthService';

interface StripeCheckoutFormProps {
  bookingReference: string;
  bookingId: string;
  amount: number;
  currency: string;
}

const StripeCheckoutForm = ({
  bookingReference,
  bookingId,
  amount,
  currency,
}: StripeCheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please wait and try again.');
      return;
    }

    // Check if the payment element is ready
    if (!isReady) {
      setErrorMessage('Payment form is still loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/confirmation`,
        },
        redirect: 'if_required', // Only redirect if required by payment method
      });

      if (error) {
        // Payment failed
        console.error('[StripeCheckoutForm] Payment error:', error);
        setErrorMessage(error.message || 'An unexpected error occurred.');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        console.log('[StripeCheckoutForm] Payment succeeded:', paymentIntent.id);

        // Confirm the booking directly (bypass Kafka dependency)
        try {
          const VOYAGE_API_URL = import.meta.env.VITE_VOYAGE_API_URL;
          const confirmResponse = await fetch(`${VOYAGE_API_URL}/api/bookings/${bookingReference}/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              paymentIntentId: paymentIntent.id,
            }),
          });

          if (confirmResponse.ok) {
            const confirmData = await confirmResponse.json();
            console.log('[StripeCheckoutForm] Booking confirmed:', confirmData);
          } else {
            console.warn('[StripeCheckoutForm] Failed to confirm booking, will rely on Kafka flow');
          }
        } catch (confirmError) {
          console.warn('[StripeCheckoutForm] Error confirming booking:', confirmError);
          // Don't fail - payment was successful, booking confirmation might happen via Kafka
        }

        // Clear the cart after successful payment
        await clearCart(userId);

        // Navigate to confirmation page with payment data
        navigate('/payment/confirmation', {
          state: {
            paymentIntent,
            bookingReference,
            bookingId,
            amount,
            currency,
          },
        });
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is processing (e.g., bank transfer)
        console.log('[StripeCheckoutForm] Payment processing:', paymentIntent.id);

        // Navigate to confirmation page with processing status
        navigate('/payment/confirmation', {
          state: {
            paymentIntent,
            bookingReference,
            bookingId,
            amount,
            currency,
            processing: true,
          },
        });
      } else {
        // Unexpected status
        console.warn('[StripeCheckoutForm] Unexpected payment status:', paymentIntent?.status);
        setErrorMessage('Payment status is unclear. Please contact support.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('[StripeCheckoutForm] Unexpected error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - Stripe's unified payment input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <PaymentElement
          id="payment-element"
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                // Pre-fill if you have user data
              },
            },
          }}
          onReady={() => {
            console.log('[StripeCheckoutForm] Payment Element is ready');
            setIsReady(true);
          }}
          onLoadError={(error) => {
            console.error('[StripeCheckoutForm] Payment Element load error:', error);
            setErrorMessage('Failed to load payment form. Please refresh the page.');
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-md p-4 border border-orange-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking Reference:</span>
            <span className="font-medium text-gray-900">{bookingReference}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-orange-300 mt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
              {currency} {Number(amount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || !isReady || isProcessing}
        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
          !stripe || !elements || !isReady || isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 active:from-orange-700 active:to-pink-700'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing Payment...
          </span>
        ) : !isReady ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading Payment Form...
          </span>
        ) : (
          `Pay ${currency} ${Number(amount).toFixed(2)}`
        )}
      </button>

      {/* Cancel Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={isProcessing}
        className="w-full py-2 px-4 rounded-md font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>

      {/* Terms Notice */}
      <p className="text-xs text-gray-500 text-center">
        By completing this payment, you agree to our{' '}
        <a href="/terms" className="text-orange-600 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-orange-600 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
};

export default StripeCheckoutForm;
