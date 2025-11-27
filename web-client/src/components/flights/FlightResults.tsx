import React from 'react';
import { Clock, Plane, Star, Shield, Leaf, Users, Wifi, Coffee } from 'lucide-react';
import type { FlightOffer } from '@/services/api/types';
import airlineService from '@/services/airlineService';

interface FlightResultsProps {
  flights: FlightOffer[];
  onSelect: (flight: FlightOffer) => void;
}

const FlightResults: React.FC<FlightResultsProps> = ({ flights, onSelect }) => {
  const formatDuration = (duration: string) => {
    // Convert ISO duration to readable format
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate estimated CO2 emissions based on distance and aircraft type
  // This is a simplified calculation for demonstration
  const calculateCO2Emissions = (segment: FlightOffer['itineraries'][0]['segments'][0]) => {
    // Average CO2 emissions per passenger per kilometer
    const emissionsPerKm = 0.115; // kg CO2
    
    // Estimate distance based on flight duration (rough estimation)
    const durationMatch = segment.duration.match(/(\d+)H/);
    const hours = durationMatch ? parseInt(durationMatch[1]) : 0;
    const estimatedDistance = hours * 800; // Assume average speed of 800 km/h
    
    return Math.round(estimatedDistance * emissionsPerKm);
  };

  const getFlightAmenities = (carrierCode: string, cabinClass: string = 'ECONOMY') => {
    // Mock amenities based on airline and class
    const amenities = [];
    
    // Premium airlines typically offer more amenities
    const premiumAirlines = ['EK', 'QR', 'SQ', 'EY', 'LH', 'BA', 'AF'];
    
    if (premiumAirlines.includes(carrierCode)) {
      amenities.push('WiFi', 'Entertainment', 'Meals');
    } else {
      amenities.push('Entertainment');
    }
    
    if (cabinClass !== 'ECONOMY') {
      amenities.push('Priority Boarding', 'Extra Legroom');
    }
    
    return amenities;
  };

  return (
    <div className="space-y-6">
      {flights.map((flight) => {
        // Validate flight data structure
        if (!flight.itineraries || flight.itineraries.length === 0) return null;
        if (!flight.itineraries[0].segments || flight.itineraries[0].segments.length === 0) return null;

        const firstSegment = flight.itineraries[0].segments[0];
        if (!firstSegment) return null;

        const co2Emissions = calculateCO2Emissions(firstSegment);
        const airlineName = airlineService.getAirlineName(firstSegment.carrierCode);
        const airlineLogo = airlineService.getAirlineLogo(firstSegment.carrierCode);
        const aircraftType = airlineService.getAircraftType(firstSegment.aircraft?.code);
        const amenities = getFlightAmenities(firstSegment.carrierCode);

        return (
          <div
            key={flight.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                {/* Airline Info & Flight Details */}
                <div className="flex items-start gap-6 flex-1">
                  {/* Airline Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                      {airlineLogo ? (
                        <img
                          src={airlineLogo}
                          alt={airlineName}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Plane className={`w-8 h-8 text-gray-400 ${airlineLogo ? 'hidden' : ''}`} />
                    </div>
                  </div>

                  {/* Flight Route & Times */}
                  <div className="flex-1">
                    {/* Airline Name & Flight Number */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{airlineName}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
                        {firstSegment.carrierCode} {firstSegment.number}
                      </span>
                      {flight.oneWay ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          One Way
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                          Round Trip
                        </span>
                      )}
                    </div>

                    {/* Route Information */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTime(firstSegment.departure.at)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(firstSegment.departure.at)}
                        </div>
                        <div className="text-lg font-semibold text-gray-700 mt-1">
                          {firstSegment.departure.iataCode}
                        </div>
                        {firstSegment.departure.terminal && (
                          <div className="text-xs text-gray-500">
                            Terminal {firstSegment.departure.terminal}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(firstSegment.duration)}</span>
                        </div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1">
                            <Plane className="w-4 h-4 text-orange-500 transform rotate-90" />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {firstSegment.numberOfStops === 0 ? 'Direct' : `${firstSegment.numberOfStops} stop${firstSegment.numberOfStops > 1 ? 's' : ''}`}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTime(firstSegment.arrival.at)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(firstSegment.arrival.at)}
                        </div>
                        <div className="text-lg font-semibold text-gray-700 mt-1">
                          {firstSegment.arrival.iataCode}
                        </div>
                        {firstSegment.arrival.terminal && (
                          <div className="text-xs text-gray-500">
                            Terminal {firstSegment.arrival.terminal}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Aircraft & Additional Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {firstSegment.aircraft?.code && (
                        <>
                          <div className="flex items-center gap-1">
                            <Plane className="w-4 h-4" />
                            <span>{aircraftType}</span>
                          </div>
                          <div>•</div>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>{flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY'}</span>
                      </div>
                      <div>•</div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{flight.numberOfBookableSeats} seats left</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="text-right flex-shrink-0 ml-6">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1 justify-end mb-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {flight.price.currency} {flight.price.total}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                    {flight.price.fees && flight.price.fees.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        + taxes & fees
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onSelect(flight)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-lg"
                  >
                    Select Flight
                  </button>
                </div>
              </div>
            </div>

            {/* Amenities & Environmental Info */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-orange-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Amenities */}
                  <div className="flex items-center gap-4 text-sm">
                    {amenities.includes('WiFi') && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Wifi className="w-4 h-4" />
                        <span>WiFi</span>
                      </div>
                    )}
                    {amenities.includes('Entertainment') && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Star className="w-4 h-4" />
                        <span>Entertainment</span>
                      </div>
                    )}
                    {amenities.includes('Meals') && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Coffee className="w-4 h-4" />
                        <span>Meals</span>
                      </div>
                    )}
                  </div>

                  {/* Booking Benefits */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Free cancellation 24h</span>
                    </div>
                  </div>
                </div>

                {/* CO2 Emissions */}
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Leaf className="w-4 h-4" />
                  <span>{co2Emissions} kg CO₂e per passenger</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {flights.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plane className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Flights Found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any flights matching your criteria. Try adjusting your search parameters or selecting different dates.
          </p>
        </div>
      )}
    </div>
  );
};

export default FlightResults;