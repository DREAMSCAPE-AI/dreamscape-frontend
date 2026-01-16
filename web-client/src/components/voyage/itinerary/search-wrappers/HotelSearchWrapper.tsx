import React, { useState } from 'react';
import { Hotel, Check } from 'lucide-react';
import HotelSearch from '@/components/hotels/HotelSearch';

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

  const handleSearch = async (params: any) => {
    setIsSearching(true);
    // Mock results - replace with actual API
    setTimeout(() => {
      setSearchResults([
        {
          id: 'HTL001',
          name: 'Grand Hotel Plaza',
          location: params.city || 'Paris',
          checkInDate: params.checkInDate,
          checkOutDate: params.checkOutDate,
          roomType: 'Deluxe Room',
          guests: params.adults || 2,
          nights: 3,
          rating: 5,
          price: { total: 450, currency: 'USD' }
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <HotelSearch onSearch={handleSearch} loading={isSearching} />
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Available Hotels ({searchResults.length})</h3>
          {searchResults.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => onSelectHotel(hotel)}
              className={`bg-white rounded-lg border-2 p-4 cursor-pointer hover:shadow-md ${
                selectedHotelId === hotel.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hotel className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">{hotel.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{hotel.location}</p>
                  <p className="text-sm text-gray-600">{hotel.roomType} - {hotel.nights} nights</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{hotel.price.currency} {hotel.price.total}</div>
                  {selectedHotelId === hotel.id && (
                    <div className="flex items-center gap-2 text-orange-600 mt-2">
                      <Check className="w-5 h-5" />
                      <span>Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelSearchWrapper;
