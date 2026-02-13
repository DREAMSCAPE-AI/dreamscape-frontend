import React, { useState } from 'react';
import { Plane, Check } from 'lucide-react';
import FlightSearch from '@/components/flights/FlightSearch';
import voyageService from '@/services/voyage/VoyageService';
import type { UIFlightSearchParams, FlightOffer } from '@/services/voyage/types';
import { formatTime, formatDuration, formatDate } from '@/utils/flightUtils';

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
      const result = await voyageService.searchFlights({
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        travelClass: params.travelClass,
        nonStop: params.nonStop,
        maxPrice: params.maxPrice,
        max: params.max || 250
      });

      console.log('[FlightSearchWrapper] Raw result:', result);
      console.log('[FlightSearchWrapper] result.data:', result?.data);
      console.log('[FlightSearchWrapper] result.data.data:', result?.data?.data);

      const flights: FlightOffer[] = result?.data?.data || result?.data || [];

      console.log('[FlightSearchWrapper] Extracted flights array:', flights);
      console.log('[FlightSearchWrapper] API returned flights:', flights.length);
      console.log('[FlightSearchWrapper] First flight structure:', flights[0]);
      console.log('[FlightSearchWrapper] First flight has itineraries?', !!flights[0]?.itineraries);

      const flightsWithPassengers = flights.map(flight => ({
        ...flight,
        passengers: {
          adults: params.adults,
          children: params.children || 0,
          infants: params.infants || 0
        }
      }));

      console.log('[FlightSearchWrapper] After adding passengers:', flightsWithPassengers[0]);

      setSearchResults(flightsWithPassengers);
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

          {searchResults.map((flight) => {
            const hasItineraries = !!flight.itineraries?.[0]?.segments;

            let carrierCode, flightNumber, fullFlightNumber, origin, destination;
            let departureTime, arrivalTime, departureDisplay, arrivalDisplay, departureDate;
            let duration, durationDisplay, outboundSegments;

            if (hasItineraries) {
              outboundSegments = flight.itineraries[0].segments;
              const firstSegment = outboundSegments[0];
              const lastSegment = outboundSegments[outboundSegments.length - 1];

              carrierCode = firstSegment?.carrierCode || flight.validatingAirlineCodes?.[0] || '';
              flightNumber = firstSegment?.number || '';
              fullFlightNumber = `${carrierCode}${flightNumber}`;
              origin = firstSegment?.departure?.iataCode || '';
              destination = lastSegment?.arrival?.iataCode || '';
              departureTime = firstSegment?.departure?.at || '';
              arrivalTime = lastSegment?.arrival?.at || '';
              duration = flight.itineraries[0]?.duration || '';
            } else {
              carrierCode = flight.airline?.code || flight.carrierCode || '';
              flightNumber = flight.flightNumber || '';
              fullFlightNumber = flightNumber ? `${carrierCode}${flightNumber}` : carrierCode;

              origin = typeof flight.departure === 'object'
                ? (flight.departure?.airport || flight.departure?.code || flight.departure?.iataCode || '')
                : (flight.origin || '');
              destination = typeof flight.arrival === 'object'
                ? (flight.arrival?.airport || flight.arrival?.code || flight.arrival?.iataCode || '')
                : (flight.destination || '');
              departureTime = typeof flight.departure === 'object'
                ? (flight.departure?.time || flight.departure?.at || '')
                : (flight.departureTime || '');
              arrivalTime = typeof flight.arrival === 'object'
                ? (flight.arrival?.time || flight.arrival?.at || '')
                : (flight.arrivalTime || '');

              duration = flight.duration || '';
              outboundSegments = flight.stops === 0 ? [{}] : Array(flight.stops + 1).fill({});
            }

            departureDisplay = formatTime(departureTime);
            arrivalDisplay = formatTime(arrivalTime);
            departureDate = formatDate(departureTime);
            durationDisplay = formatDuration(duration);

            return (
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
                          {fullFlightNumber}
                        </h4>
                        <p className="text-sm text-gray-600">{carrierCode}</p>
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Departure</p>
                        <p className="font-semibold text-lg">{origin}</p>
                        <p className="text-gray-900">{departureDisplay}</p>
                        <p className="text-gray-500 text-xs">{departureDate}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold">{durationDisplay}</p>
                        <p className="text-gray-500 text-xs">
                          {outboundSegments.length === 1 ? 'Direct' : `${outboundSegments.length} stops`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">Arrival</p>
                        <p className="font-semibold text-lg">{destination}</p>
                        <p className="text-gray-900">{arrivalDisplay}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price & Selection */}
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {flight.price?.currency || 'EUR'} {flight.price?.total || '0'}
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
            );
          })}
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
