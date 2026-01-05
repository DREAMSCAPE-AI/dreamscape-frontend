/**
 * Checkout Page - Stripe Payment Integration
 * Handles payment processing for cart checkout
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import { useAuth } from '@/services/auth/AuthService';

interface CheckoutData {
  bookingReference: string;
  bookingId: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    type: string;
    itemId: string;
    itemData: any;
    quantity: number;
    price: number;
    currency: string;
  }>;
  payment: {
    clientSecret: string;
    publishableKey: string | null;
    paymentIntentId: string;
    amount: number;
    currency: string;
  };
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please log in to continue with checkout.');
      setLoading(false);
      setTimeout(() => navigate('/auth/login', { state: { from: '/checkout' } }), 3000);
      return;
    }

    // Get checkout data from navigation state
    const data = location.state?.checkoutData as CheckoutData | undefined;

    if (!data) {
      setError('No checkout data found. Please start from your cart.');
      setLoading(false);
      setTimeout(() => navigate('/cart'), 3000);
      return;
    }

    // Validate required payment data
    if (!data.payment?.clientSecret || !data.payment?.publishableKey) {
      setError('Invalid payment configuration. Please try again.');
      setLoading(false);
      return;
    }

    // Initialize Stripe with publishable key
    const stripePublishableKey = data.payment.publishableKey;
    setStripePromise(loadStripe(stripePublishableKey));
    setCheckoutData(data);
    setLoading(false);
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error || !checkoutData || !stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Checkout Error</h2>
            <p className="mt-2 text-gray-600">{error || 'Unable to load payment form'}</p>
            <button
              onClick={() => navigate('/cart')}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret: checkoutData.payment.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#f97316',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Booking Summary - Left Side */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">Booking Summary</h2>
                <p className="text-orange-50 text-sm mt-1">
                  Reference: {checkoutData.bookingReference}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {checkoutData.items.map((item, index) => (
                  <div
                    key={`${item.itemId}-${index}`}
                    className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800">
                            {item.type}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-sm text-gray-500">
                              x{item.quantity}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          {item.type === 'FLIGHT' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <p className="font-bold text-lg text-gray-900">
                                    {item.itemData?.origin || item.itemData?.departure?.iataCode || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.itemData?.departureDate
                                      ? new Date(item.itemData.departureDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : item.itemData?.departure?.at
                                      ? new Date(item.itemData.departure.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : 'N/A'}
                                  </p>
                                </div>
                                <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                <div className="text-center">
                                  <p className="font-bold text-lg text-gray-900">
                                    {item.itemData?.destination || item.itemData?.arrival?.iataCode || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.itemData?.arrivalDate
                                      ? new Date(item.itemData.arrivalDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : item.itemData?.arrival?.at
                                      ? new Date(item.itemData.arrival.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 font-medium">
                                {item.itemData?.departureDate
                                  ? new Date(item.itemData.departureDate).toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                  : item.itemData?.departure?.at
                                  ? new Date(item.itemData.departure.at).toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                  : 'N/A'}
                              </p>
                              {(item.itemData?.validatingAirlineCodes?.[0] || item.itemData?.carrierCode) && (
                                <p className="text-xs text-gray-500">
                                  Carrier: {item.itemData.validatingAirlineCodes?.[0] || item.itemData.carrierCode} {item.itemData.number ? `• Flight ${item.itemData.number}` : ''}
                                </p>
                              )}
                              {item.itemData?.duration && (
                                <p className="text-xs text-gray-500">
                                  Duration: {item.itemData.duration.replace('PT', '').replace('H', 'h ').replace('M', 'min')}
                                </p>
                              )}
                            </div>
                          )}

                          {item.type === 'HOTEL' && (
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.itemData?.name || 'Hotel Booking'}
                              </p>
                              {(item.itemData?.location || item.itemData?.address?.cityName) && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.itemData.location || item.itemData.address.cityName}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {item.itemData?.checkInDate && item.itemData?.checkOutDate
                                  ? `${new Date(item.itemData.checkInDate).toLocaleDateString()} - ${new Date(item.itemData.checkOutDate).toLocaleDateString()}`
                                  : 'N/A'
                                }
                              </p>
                            </div>
                          )}

                          {item.type === 'ACTIVITY' && (
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.itemData?.name || 'Activity Booking'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.currency} {(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">
                            {item.currency} {Number(item.price).toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t-2 border-gray-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                      {checkoutData.currency} {Number(checkoutData.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-orange-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-900">Secure Payment</h3>
                  <p className="mt-1 text-sm text-orange-700">
                    Your payment information is encrypted and processed securely by Stripe.
                    We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white shadow-md rounded-lg overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-4">
                <h2 className="text-xl font-bold">Payment Details</h2>
              </div>

              <div className="p-6">
                <Elements stripe={stripePromise} options={options}>
                  <StripeCheckoutForm
                    bookingReference={checkoutData.bookingReference}
                    bookingId={checkoutData.bookingId}
                    amount={checkoutData.totalAmount}
                    currency={checkoutData.currency}
                  />
                </Elements>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
