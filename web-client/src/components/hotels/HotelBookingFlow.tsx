import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import HotelSearch from './HotelSearch';
import HotelResults from './HotelResults';
import HotelDetails from './HotelDetails';
import ApiService from '../../services/api';
import type { HotelOffer, HotelSearchParams } from '../../services/api/types';

type BookingStep = 'search' | 'results' | 'details' | 'passengers' | 'payment';

const HotelBookingFlow: React.FC = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [searchResults, setSearchResults] = useState<HotelOffer[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced hotel search function with better image handling
  const handleSearch = async (params: HotelSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiService.searchHotels(params);

      // Transform Amadeus response to our HotelOffer format with enhanced image handling
      const hotels: HotelOffer[] = await Promise.all(
        (result.data || []).map(async (offer: any) => {
          const hotelId = offer.hotel?.hotelId || offer.id || Math.random().toString();
          
          // Try to get additional images from the dedicated images endpoint
          let additionalImages: any[] = [];
          try {
            const imageResult = await ApiService.getHotelImages(hotelId, {
              adults: params.adults,
              roomQuantity: params.roomQuantity,
              checkInDate: params.checkInDate,
              checkOutDate: params.checkOutDate
            });
            additionalImages = imageResult.data?.[0]?.hotel?.media || [];
          } catch (imageError) {
            console.warn('Could not fetch additional images for hotel:', hotelId, imageError);
          }

          // Combine original media with additional images, removing duplicates
          const originalMedia = offer.hotel?.media || [];
          const allMedia = [...originalMedia];
          
          // Add additional images if they don't already exist
          additionalImages.forEach((img: any) => {
            if (!allMedia.some((existing: any) => existing.uri === img.uri)) {
              allMedia.push(img);
            }
          });

          // Fallback images if no media available
          const fallbackImages = [
            { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80', category: 'EXTERIOR' },
            { uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80', category: 'ROOM' },
            { uri: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80', category: 'LOBBY' }
          ];

          return {
            id: hotelId,
            hotelId: hotelId,
            chainCode: offer.hotel?.chainCode || 'Independent',
            name: offer.hotel?.name || 'Hotel',
            rating: offer.hotel?.rating || '3',
            description: offer.hotel?.description || { text: 'A comfortable hotel stay with modern amenities and excellent service.', lang: 'en' },
            amenities: offer.hotel?.amenities || ['WIFI', 'RESTAURANT'],
            media: allMedia.length > 0 ? allMedia : fallbackImages,
            price: {
              currency: offer.offers?.[0]?.price?.currency || 'USD',
              total: offer.offers?.[0]?.price?.total || '150',
              base: offer.offers?.[0]?.price?.base || '130',
              fees: offer.offers?.[0]?.price?.fees || [],
              grandTotal: offer.offers?.[0]?.price?.grandTotal || offer.offers?.[0]?.price?.total || '150'
            },
            policies: offer.offers?.[0]?.policies || [
              {
                type: 'CANCELLATION',
                description: { text: 'Free cancellation until 24 hours before check-in', lang: 'en' }
              }
            ],
            room: offer.offers?.[0]?.room || {
              type: 'STANDARD',
              typeEstimated: { category: 'STANDARD_ROOM', beds: 1, bedType: 'DOUBLE' },
              description: { text: 'Comfortable room with modern amenities', lang: 'en' }
            }
          };
        })
      );

      setSearchResults(hotels);
      setCurrentStep('results');
    } catch (error) {
      console.error('Hotel search error:', error);
      setError(error instanceof Error ? error.message : 'Failed to search hotels. Please try again.');
      
      // Provide enhanced fallback hotels for testing
      const fallbackHotels: HotelOffer[] = [
        {
          id: 'fallback-1',
          hotelId: 'HOTEL001',
          chainCode: 'Marriott',
          name: 'Grand City Hotel',
          rating: '4',
          description: { text: 'Luxury hotel in the heart of the city with modern amenities and excellent service.', lang: 'en' },
          amenities: ['WIFI', 'POOL', 'FITNESS_CENTER', 'RESTAURANT', 'PARKING'],
          media: [
            { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80', category: 'EXTERIOR' },
            { uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80', category: 'ROOM' },
            { uri: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80', category: 'LOBBY' },
            { uri: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80', category: 'RESTAURANT' }
          ],
          price: {
            currency: 'USD',
            total: '299',
            base: '250',
            fees: [{ amount: '49', type: 'TAXES' }],
            grandTotal: '299'
          },
          policies: [
            {
              type: 'CANCELLATION',
              description: { text: 'Free cancellation until 24 hours before check-in', lang: 'en' }
            }
          ],
          room: {
            type: 'DELUXE',
            typeEstimated: { category: 'DELUXE_ROOM', beds: 1, bedType: 'KING' },
            description: { text: 'Spacious deluxe room with city view', lang: 'en' }
          }
        },
        {
          id: 'fallback-2',
          hotelId: 'HOTEL002',
          chainCode: 'Hilton',
          name: 'Business Center Hotel',
          rating: '4',
          description: { text: 'Perfect for business travelers with meeting facilities and high-speed internet.', lang: 'en' },
          amenities: ['WIFI', 'BUSINESS_CENTER', 'FITNESS_CENTER', 'RESTAURANT'],
          media: [
            { uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80', category: 'EXTERIOR' },
            { uri: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80', category: 'ROOM' },
            { uri: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80', category: 'BUSINESS_CENTER' }
          ],
          price: {
            currency: 'USD',
            total: '189',
            base: '159',
            fees: [{ amount: '30', type: 'TAXES' }],
            grandTotal: '189'
          },
          policies: [
            {
              type: 'CANCELLATION',
              description: { text: 'Free cancellation until 48 hours before check-in', lang: 'en' }
            }
          ],
          room: {
            type: 'STANDARD',
            typeEstimated: { category: 'STANDARD_ROOM', beds: 2, bedType: 'DOUBLE' },
            description: { text: 'Comfortable business room with work desk', lang: 'en' }
          }
        }
      ];
      
      setSearchResults(fallbackHotels);
      setCurrentStep('results');
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
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 'search', label: 'Search' },
              { step: 'results', label: 'Select Hotel' },
              { step: 'details', label: 'Hotel Details' },
              { step: 'passengers', label: 'Passenger Info' },
              { step: 'payment', label: 'Payment' }
            ].map(({ step, label }, index) => (
              <div
                key={step}
                className="flex items-center"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === step
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-600">
                  {label}
                </div>
                {index < 4 && (
                  <div className="w-24 h-0.5 mx-2 bg-gray-200" />
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

          {currentStep === 'payment' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold">Payment</h2>
              <p className="text-gray-600 mt-2">Payment implementation coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelBookingFlow;