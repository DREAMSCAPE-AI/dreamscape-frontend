import React, { useState } from 'react';
import { Hotel, Check } from 'lucide-react';
import HotelSearch from '@/components/hotels/HotelSearch';
import voyageService from '@/services/voyage/VoyageService';

interface HotelSearchWrapperProps {
  onSelectHotel: (hotel: any) => void;
  selectedHotelId?: string;
}

const HotelSearchWrapper: React.FC<HotelSearchWrapperProps> = ({
  onSelectHotel,
  selectedHotelId
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);

  const handleSearch = async (params: any) => {
    setIsSearching(true);
    setError(null);
    setSearchParams(params); // Store search params

    try {
      // Call real Amadeus API via VoyageService
      const result = await voyageService.searchHotels({
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults || 1,
        roomQuantity: params.rooms || 1
      });

      // Debug: Check API response structure
      console.log('[HotelSearchWrapper] Raw result:', result);
      console.log('[HotelSearchWrapper] result.data:', result?.data);
      console.log('[HotelSearchWrapper] result.data.data:', result?.data?.data);

      // Handle both result.data and result.data.data
      const hotels = result?.data?.data || result?.data || [];
      console.log('[HotelSearchWrapper] Extracted hotels array:', hotels);
      console.log('[HotelSearchWrapper] API returned hotels:', hotels.length);

      // Attach search params to each hotel for later use
      const hotelsWithParams = hotels.map((hotel: any) => ({
        ...hotel,
        searchCheckInDate: params.checkInDate,
        searchCheckOutDate: params.checkOutDate,
        searchCityCode: params.cityCode,
        searchAdults: params.adults || 1
      }));

      setSearchResults(hotelsWithParams);
    } catch (err) {
      setError('Failed to search hotels. Please try again.');
      console.error('Hotel search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <HotelSearch onSearch={handleSearch} loading={isSearching} />
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Available Hotels ({searchResults.length})</h3>
          {searchResults.map((hotel) => {
            // Handle both Amadeus format and backend simplified format
            const hotelName = hotel.name || hotel.hotel?.name || 'Unknown Hotel';

            // Use search params attached to hotel object (prioritize these over API data which may be empty)
            const checkInDate = hotel.searchCheckInDate || hotel.checkInDate || hotel.offers?.[0]?.checkInDate || '';
            const checkOutDate = hotel.searchCheckOutDate || hotel.checkOutDate || hotel.offers?.[0]?.checkOutDate || '';
            const location = hotel.searchCityCode || hotel.location?.name || hotel.hotel?.address?.cityName || hotel.cityCode || hotel.hotel?.cityCode || 'Unknown location';

            // Calculate nights using search dates
            let nights = hotel.nights || 1;
            if (checkInDate && checkOutDate) {
              const checkIn = new Date(checkInDate);
              const checkOut = new Date(checkOutDate);
              nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            }

            // Room description - handle both formats
            const roomDescription = hotel.roomType ||
                                    hotel.offers?.[0]?.room?.description?.text ||
                                    hotel.offers?.[0]?.room?.typeEstimated?.category ||
                                    'Room';

            // Price - extract from price object structure and use default if 0
            const priceObj = hotel.price || hotel.offers?.[0]?.price;
            let price = typeof priceObj === 'object'
              ? (priceObj?.total || priceObj?.amount || priceObj?.base || 0)
              : (priceObj || 0);

            // If price is 0, use default pricing (same as transformation layer)
            if (price === 0 && nights) {
              price = nights * 50; // Default: 50 EUR per night
            }

            const currency = priceObj?.currency || 'EUR';

            return (
              <div
                key={hotel.hotelId || hotel.hotel?.hotelId || hotel.id}
                onClick={() => onSelectHotel(hotel)}
                className={`bg-white rounded-lg border-2 p-4 cursor-pointer hover:shadow-md ${
                  selectedHotelId === (hotel.hotelId || hotel.hotel?.hotelId) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Hotel className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">{hotelName}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{location}</p>
                    <p className="text-sm text-gray-600">
                      {roomDescription} - {nights} night{nights > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {currency} {price}
                    </div>
                    {selectedHotelId === (hotel.hotelId || hotel.hotel?.hotelId) && (
                      <div className="flex items-center gap-2 text-orange-600 mt-2">
                        <Check className="w-5 h-5" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HotelSearchWrapper;
