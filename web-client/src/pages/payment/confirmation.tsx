/**
 * Payment Confirmation Page
 * Displays payment success/failure status and booking details
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight, Download } from 'lucide-react';
import type { PaymentIntent } from '@stripe/stripe-js';
import { useAuth } from '@/services/auth/AuthService';

interface ConfirmationPageState {
  paymentIntent: PaymentIntent;
  bookingReference: string;
  bookingId: string;
  amount: number;
  currency: string;
  processing?: boolean;
}

const PaymentConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [confirmationData, setConfirmationData] = useState<ConfirmationPageState | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setTimeout(() => navigate('/auth', { state: { from: '/payment/confirmation' } }), 2000);
      return;
    }

    const state = location.state as ConfirmationPageState | undefined;

    if (!state) {
      // No confirmation data - redirect to home
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    setConfirmationData(state);
  }, [location, navigate, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="mt-2 text-gray-600">Please log in to view your payment confirmation.</p>
            <p className="mt-1 text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!confirmationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  const { paymentIntent, bookingReference, bookingId, amount, currency, processing } = confirmationData;
  const isSuccess = paymentIntent.status === 'succeeded';
  const isProcessing = paymentIntent.status === 'processing' || processing;
  const isFailed = !isSuccess && !isProcessing;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success State */}
        {isSuccess && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="w-16 h-16 text-orange-500" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-orange-50 text-lg">Your booking has been confirmed</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Booking Reference:</span>
                    <span className="font-mono font-semibold text-gray-900">{bookingReference}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono text-sm text-gray-700">{bookingId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-sm text-gray-700">{paymentIntent.id}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className="text-lg font-semibold text-gray-900">Amount Paid:</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                      {currency} {Number(amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex items-start">
                    <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
                    <span>A confirmation email has been sent to your registered email address</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
                    <span>You can view and manage your booking in your account dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
                    <span>Keep your booking reference handy for future correspondence</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  View My Bookings
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-orange-300 shadow-sm hover:shadow transition-all duration-200"
                >
                  Back to Home
                </button>
              </div>

              {/* Receipt Download */}
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    // TODO: Implement receipt download
                    console.log('Download receipt for:', bookingReference);
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt (PDF)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Payment Processing</h1>
              <p className="text-yellow-100 text-lg">We're processing your payment</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-3">What's happening?</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Your payment is being processed. This can take a few minutes depending on your
                  payment method. You'll receive a confirmation email once the payment is complete.
                </p>
                <div className="space-y-2 text-sm text-yellow-800">
                  <div className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    <span>Booking Reference: <strong>{bookingReference}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    <span>Amount: <strong>{currency} {amount.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:shadow transition-all duration-200"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
              <p className="text-red-100 text-lg">We couldn't process your payment</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h3 className="font-semibold text-red-900 mb-3">What went wrong?</h3>
                <p className="text-sm text-red-800 mb-4">
                  {paymentIntent.last_payment_error?.message ||
                    'Your payment could not be processed. Please check your payment details and try again.'}
                </p>
                <div className="text-sm text-red-800">
                  <p className="mb-2"><strong>Common reasons for payment failure:</strong></p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Insufficient funds</li>
                    <li>Incorrect card details</li>
                    <li>Card declined by your bank</li>
                    <li>Payment method not supported</li>
                  </ul>
                </div>
              </div>

              {/* Booking Reference (if available) */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Your Booking</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Your booking (<strong>{bookingReference}</strong>) has been created but not confirmed.
                  You can return to your cart to try the payment again.
                </p>
                <div className="text-sm text-gray-600">
                  <p>Amount: <strong>{currency} {amount.toFixed(2)}</strong></p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:shadow transition-all duration-200"
                >
                  Back to Home
                </button>
              </div>

              {/* Support */}
              <div className="text-center pt-4 text-sm text-gray-600">
                Need help?{' '}
                <a href="/support" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
