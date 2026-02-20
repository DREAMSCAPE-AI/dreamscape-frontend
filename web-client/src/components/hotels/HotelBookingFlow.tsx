import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HotelSearch from './HotelSearch';
import HotelResults from './HotelResults';
import HotelDetails from './HotelDetails';
import ApiService from '@/services/voyage/VoyageService';
import type { HotelOffer, HotelSearchParams } from '@/services/voyage/types';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/services/auth/AuthService';

type BookingStep = 'search' | 'results' | 'details' | 'passengers' | 'payment';

const HotelBookingFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [searchResults, setSearchResults] = useState<HotelOffer[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<any>(null);

  const { addToCart, openDrawer, checkout } = useCartStore();

  // Enhanced hotel search function with better image handling
  const handleSearch = async (params: HotelSearchParams) => {
    setLoading(true);
    setError(null);
    setSearchParams(params);
    try {
      const result = await ApiService.searchHotels(params);

      // DR-573: backend returns SimplifiedHotelOfferDTO, map fields accordingly
      const fallbackImages = [
        { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80', category: 'EXTERIOR' },
        { uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80', category: 'ROOM' },
        { uri: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80', category: 'LOBBY' }
      ];

      const hotels: HotelOffer[] = (result.data || []).map((offer: any) => {
          const images = offer.images?.length > 0
            ? offer.images.map((uri: string) => ({ uri, category: 'EXTERIOR' }))
            : fallbackImages;

          const cancellationText = offer.cancellation?.freeCancellation
            ? `Free cancellation${offer.cancellation.deadline ? ` until ${offer.cancellation.deadline}` : ' available'}`
            : offer.cancellation?.penalty
              ? `Cancellation fee: ${offer.cancellation.penalty} ${offer.price?.currency || ''}`
              : 'Non-refundable';

          const totalStr = offer.price?.amount?.toString() || '0';
          const baseStr = offer.price?.base?.toString() || totalStr;
          const taxesStr = offer.price?.taxes?.toString() || '0';

          return {
            id: offer.id,
            hotelId: offer.hotelId,
            chainCode: offer.chainCode || 'Independent',
            name: offer.name || 'Hotel',
            cityCode: offer.cityCode || null,
            location: offer.location || { latitude: null, longitude: null },
            address: offer.address || { street: null, city: null, postalCode: null, country: null },
            rating: offer.rating?.toString() || '3',
            description: { text: offer.room?.description || 'A comfortable hotel stay with modern amenities and excellent service.', lang: 'en' },
            amenities: offer.amenities || ['WIFI', 'RESTAURANT'],
            media: images,
            price: {
              currency: offer.price?.currency || 'USD',
              total: totalStr,
              base: baseStr,
              fees: parseFloat(taxesStr) > 0 ? [{ amount: taxesStr, type: 'TAXES' }] : [],
              grandTotal: totalStr
            },
            policies: [{ type: 'CANCELLATION', description: { text: cancellationText, lang: 'en' } }],
            room: {
              type: offer.room?.type || 'STANDARD',
              typeEstimated: { category: offer.room?.type || 'STANDARD_ROOM', beds: offer.room?.beds || 1, bedType: offer.room?.bedType || 'DOUBLE' },
              description: { text: offer.room?.description || 'Comfortable room with modern amenities', lang: 'en' }
            }
          };
        });

      setSearchResults(hotels);
      setCurrentStep('results');
    } catch (error) {
      console.error('Hotel search error:', error);
      setError(error instanceof Error ? error.message : 'Failed to search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = (hotel: HotelOffer) => {
    setSelectedHotel(hotel);
    setCurrentStep('details');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-6 md:mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {[
              { step: 'search', label: 'Search' },
              { step: 'results', label: 'Select Hotel' },
              { step: 'details', label: 'Hotel Details' },
              { step: 'passengers', label: 'Passenger Info' },
              { step: 'payment', label: 'Payment' }
            ].map(({ step, label }, index) => (
              <div
                key={step}
                className="flex items-center flex-shrink-0"
              >
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base flex-shrink-0 ${
                    currentStep === step
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className={`mt-1 text-xs md:text-sm font-medium whitespace-nowrap ${
                    currentStep === step
                      ? 'text-orange-600'
                      : 'text-gray-600'
                  }`}>
                    {label}
                  </div>
                </div>
                {index < 4 && (
                  <div className="w-8 md:w-24 h-0.5 mx-1 md:mx-2 bg-gray-200 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'search' && (
            <HotelSearch
              onSearch={handleSearch}
              initialValues={location.state}
              loading={loading}
              error={error}
            />
          )}

          {currentStep === 'results' && (
            <div className="space-y-6">
              <HotelSearch
                onSearch={handleSearch}
                initialValues={location.state}
                loading={loading}
                error={error}
              />
              <HotelResults
                hotels={searchResults}
                onSelect={handleHotelSelect}
                loading={loading}
              />
            </div>
          )}

          {currentStep === 'details' && selectedHotel && (
            <HotelDetails
              hotel={selectedHotel}
              onClose={() => setCurrentStep('results')}
              onBack={() => setCurrentStep('results')}
              onSelectRoom={() => setCurrentStep('passengers')}
            />
          )}

          {currentStep === 'passengers' && selectedHotel && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
              <p className="text-gray-600 mb-4">Please provide guest details for your reservation.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('details')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('payment')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && selectedHotel && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Payment</h2>

              {/* Hotel Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedHotel.name}</h3>
                <div className="text-sm text-gray-600">
                  <p>Check-in: {searchParams?.checkInDate || 'N/A'}</p>
                  <p>Check-out: {searchParams?.checkOutDate || 'N/A'}</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    Total: {selectedHotel.price.currency} {selectedHotel.price.grandTotal}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Add to Cart Button */}
                <button
                  onClick={async () => {
                    if (!selectedHotel) return;
                    try {
                      await addToCart({
                        userId: userId,
                        type: 'HOTEL',
                        itemId: selectedHotel.hotelId || selectedHotel.id,
                        itemData: {
                          ...selectedHotel,
                          name: selectedHotel.name,
                          location: searchParams?.cityCode || searchParams?.location || 'N/A',
                          checkInDate: searchParams?.checkInDate,
                          checkOutDate: searchParams?.checkOutDate,
                          bookingDetails: {
                            guests: guestInfo,
                            searchParams,
                          },
                        },
                        quantity: 1,
                        price: parseFloat(selectedHotel.price.grandTotal || selectedHotel.price.total || '0'),
                        currency: selectedHotel.price.currency || 'USD',
                      });
                      openDrawer();
                      alert('Hotel added to cart successfully!');
                    } catch (error) {
                      console.error('Failed to add to cart:', error);
                      alert('Failed to add hotel to cart. Please try again.');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>

                {/* Pay Now Button */}
                <button
                  onClick={async () => {
                    if (!selectedHotel) return;
                    try {
                      await addToCart({
                        userId: userId,
                        type: 'HOTEL',
                        itemId: selectedHotel.hotelId || selectedHotel.id,
                        itemData: {
                          ...selectedHotel,
                          name: selectedHotel.name,
                          location: searchParams?.cityCode || searchParams?.location || 'N/A',
                          checkInDate: searchParams?.checkInDate,
                          checkOutDate: searchParams?.checkOutDate,
                          bookingDetails: {
                            guests: guestInfo,
                            searchParams,
                          },
                        },
                        quantity: 1,
                        price: parseFloat(selectedHotel.price.grandTotal || selectedHotel.price.total || '0'),
                        currency: selectedHotel.price.currency || 'USD',
                      });

                      const checkoutResponse = await checkout(userId);
                      navigate('/checkout', {
                        state: { checkoutData: checkoutResponse },
                      });
                    } catch (error) {
                      console.error('Failed to process payment:', error);
                      alert('Failed to process payment. Please try again.');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay Now - {selectedHotel.price.currency} {selectedHotel.price.grandTotal || selectedHotel.price.total}
                </button>
              </div>

              {/* Back Button */}
              <div className="mt-4">
                <button
                  onClick={() => setCurrentStep('passengers')}
                  className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelBookingFlow;