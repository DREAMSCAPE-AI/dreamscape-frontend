import React, { useState } from 'react';
import { Plane, Check } from 'lucide-react';
import FlightSearch from '@/components/flights/FlightSearch';
import type { UIFlightSearchParams } from '@/services/api/types';

interface FlightSearchWrapperProps {
  onSelectFlight: (flight: any) => void;
  selectedFlightId?: string;
}

const FlightSearchWrapper: React.FC<FlightSearchWrapperProps> = ({
  onSelectFlight,
  selectedFlightId
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: UIFlightSearchParams) => {
    setIsSearching(true);
    setError(null);

    try {
      // TODO: Replace with actual flight search API call
      // For now, returning mock data
      const mockResults = [
        {
          id: 'FL001',
          flightNumber: 'AF275',
          airline: 'Air France',
          origin: params.origin,
          destination: params.destination,
          departureTime: params.departureDate + 'T10:30:00Z',
          arrivalTime: params.departureDate + 'T18:45:00Z',
          duration: '8h15m',
          cabinClass: params.cabinClass,
          price: { total: 650, currency: 'USD' },
          passengers: { adults: params.adults, children: params.children, infants: params.infants }
        },
        {
          id: 'FL002',
          flightNumber: 'BA456',
          airline: 'British Airways',
          origin: params.origin,
          destination: params.destination,
          departureTime: params.departureDate + 'T14:00:00Z',
          arrivalTime: params.departureDate + 'T22:30:00Z',
          duration: '8h30m',
          cabinClass: params.cabinClass,
          price: { total: 720, currency: 'USD' },
          passengers: { adults: params.adults, children: params.children, infants: params.infants }
        }
      ];

      setSearchResults(mockResults);
    } catch (err) {
      setError('Failed to search flights. Please try again.');
      console.error('Flight search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <FlightSearch
          onSearch={handleSearch}
          loading={isSearching}
          error={error}
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Flights ({searchResults.length})
          </h3>

          {searchResults.map((flight) => (
            <div
              key={flight.id}
              onClick={() => onSelectFlight(flight)}
              className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedFlightId === flight.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Flight Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {flight.airline} - {flight.flightNumber}
                      </h4>
                      <p className="text-sm text-gray-600">{flight.cabinClass}</p>
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Departure</p>
                      <p className="font-semibold">{flight.origin}</p>
                      <p className="text-gray-500">
                        {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Duration</p>
                      <p className="font-semibold">{flight.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">Arrival</p>
                      <p className="font-semibold">{flight.destination}</p>
                      <p className="text-gray-500">
                        {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price & Selection */}
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {flight.price.currency} {flight.price.total}
                  </div>
                  {selectedFlightId === flight.id ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Selected</span>
                    </div>
                  ) : (
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Search for flights to add to your itinerary</p>
        </div>
      )}
    </div>
  );
};

export default FlightSearchWrapper;
