import React, { useState } from 'react';
import { 
  Plane,
  Calendar,
  Luggage,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
  Wifi,
  Coffee,
  Star
} from 'lucide-react';
import type { FlightOffer } from '../../services/api/types';
import airlineService from '../../services/airlineService';

interface FlightDetailsProps {
  flight: FlightOffer;
  onClose: () => void;
  onAccept: (flight: FlightOffer) => void;
  onBack: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({
  flight,
  onClose,
  onAccept,
  onBack
}) => {
  const [showFareRules, setShowFareRules] = useState(false);
  const [showBaggage, setShowBaggage] = useState(false);

  const formatDuration = (duration: string) => {
    // Convert ISO duration to readable format
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Flight Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Flight Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Airline Logo */}
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                {(() => {
                  const airlineLogo = airlineService.getAirlineLogo(flight.itineraries[0].segments[0].carrierCode);
                  const airlineName = airlineService.getAirlineName(flight.itineraries[0].segments[0].carrierCode);
                  
                  return airlineLogo ? (
                    <img
                      src={airlineLogo}
                      alt={airlineName}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null;
                })()}
                <Plane className={`w-8 h-8 text-gray-400 ${airlineService.getAirlineLogo(flight.itineraries[0].segments[0].carrierCode) ? 'hidden' : ''}`} />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {airlineService.getAirlineName(flight.itineraries[0].segments[0].carrierCode)}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {flight.itineraries[0].segments[0].carrierCode} {flight.itineraries[0].segments[0].number}
                </div>
                <div className="font-medium text-gray-700">
                  {flight.itineraries[0].segments[0].departure.iataCode} → {flight.itineraries[0].segments[0].arrival.iataCode}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {airlineService.getAircraftType(flight.itineraries[0].segments[0].aircraft.code)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {flight.price.currency} {flight.price.total}
              </div>
              <div className="text-sm text-gray-500">per passenger</div>
              {flight.price.fees && flight.price.fees.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">+ taxes & fees</div>
              )}
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="p-6 space-y-8">
          {/* Itinerary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Flight Itinerary</h3>
            {flight.itineraries[0].segments.map((segment) => {
              const departure = formatDateTime(segment.departure.at);
              const arrival = formatDateTime(segment.arrival.at);
              const airlineName = airlineService.getAirlineName(segment.carrierCode);
              const airlineLogo = airlineService.getAirlineLogo(segment.carrierCode);
              const aircraftType = airlineService.getAircraftType(segment.aircraft.code);
              
              // Get amenities for this segment
              const getSegmentAmenities = (carrierCode: string) => {
                const amenities = [];
                const premiumAirlines = ['EK', 'QR', 'SQ', 'EY', 'LH', 'BA', 'AF'];
                
                if (premiumAirlines.includes(carrierCode)) {
                  amenities.push({ icon: Wifi, label: 'WiFi', color: 'text-blue-600' });
                  amenities.push({ icon: Coffee, label: 'Meals', color: 'text-orange-600' });
                  amenities.push({ icon: Star, label: 'Entertainment', color: 'text-purple-600' });
                } else {
                  amenities.push({ icon: Star, label: 'Entertainment', color: 'text-purple-600' });
                }
                
                return amenities;
              };
              
              const amenities = getSegmentAmenities(segment.carrierCode);
              
              return (
                <div key={segment.id} className="bg-gray-50 rounded-xl p-6 mb-4">
                  <div className="flex items-start gap-6">
                    {/* Airline Logo */}
                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {airlineLogo ? (
                        <img
                          src={airlineLogo}
                          alt={airlineName}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Plane className={`w-6 h-6 text-gray-400 ${airlineLogo ? 'hidden' : ''}`} />
                    </div>

                    <div className="flex-1">
                      {/* Flight Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-gray-900">{airlineName}</div>
                          <div className="text-sm text-gray-500">
                            {segment.carrierCode} {segment.number} • {aircraftType}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">{formatDuration(segment.duration)}</div>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-gray-900">{departure.time}</div>
                          <div className="text-sm text-gray-500">{departure.date}</div>
                          <div className="text-lg font-semibold text-gray-700 mt-1">{segment.departure.iataCode}</div>
                          {segment.departure.terminal && (
                            <div className="text-xs text-gray-500">Terminal {segment.departure.terminal}</div>
                          )}
                        </div>

                        <div className="flex flex-col items-center px-4">
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent relative">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 p-1">
                              <Plane className="w-4 h-4 text-orange-500 transform rotate-90" />
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {segment.numberOfStops === 0 ? 'Direct' : `${segment.numberOfStops} stop${segment.numberOfStops > 1 ? 's' : ''}`}
                          </div>
                        </div>

                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-gray-900">{arrival.time}</div>
                          <div className="text-sm text-gray-500">{arrival.date}</div>
                          <div className="text-lg font-semibold text-gray-700 mt-1">{segment.arrival.iataCode}</div>
                          {segment.arrival.terminal && (
                            <div className="text-xs text-gray-500">Terminal {segment.arrival.terminal}</div>
                          )}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-500">Amenities:</div>
                        <div className="flex items-center gap-3">
                          {amenities.map((amenity, idx) => (
                            <div key={idx} className={`flex items-center gap-1 text-sm ${amenity.color}`}>
                              <amenity.icon className="w-4 h-4" />
                              <span>{amenity.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fare Rules */}
          <div>
            <button
              onClick={() => setShowFareRules(!showFareRules)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Fare Rules & Conditions</span>
              </div>
              {showFareRules ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showFareRules && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Cancellation Policy</div>
                    <p className="text-gray-600">
                      Cancellation permitted up to 24 hours before departure for a fee.
                      After that, tickets are non-refundable.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Change Policy</div>
                    <p className="text-gray-600">
                      Flight changes allowed subject to fare difference and change fee.
                      Must be made at least 3 hours before departure.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Baggage Information */}
          <div>
            <button
              onClick={() => setShowBaggage(!showBaggage)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Luggage className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Baggage Information</span>
              </div>
              {showBaggage ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showBaggage && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-medium mb-2">Cabin Baggage</h4>
                    <p className="text-sm text-gray-600">
                      1 personal item (under seat) - max 8 kg<br />
                      1 carry-on bag (overhead) - max 10 kg
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-medium mb-2">Checked Baggage</h4>
                    <p className="text-sm text-gray-600">
                      {flight.pricingOptions.includedCheckedBagsOnly
                        ? '1 checked bag included - max 23 kg'
                        : 'No checked bags included - available for purchase'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base fare</span>
                <span>{flight.price.currency} {flight.price.base}</span>
              </div>
              {flight.price.fees.map((fee, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{fee.type}</span>
                  <span>{flight.price.currency} {fee.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>Total Price</span>
                <span>{flight.price.currency} {flight.price.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Results
            </button>
            <button
              onClick={() => onAccept(flight)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <span>Continue to Booking</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;