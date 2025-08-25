import React from 'react';
import { AlertCircle, Clock, Plane, DollarSign } from 'lucide-react';
import type { FlightOffer } from '../../services/api/types';

interface RebookingOptionsProps {
  originalFlight: FlightOffer;
  alternativeFlights: FlightOffer[];
  onSelect: (flight: FlightOffer) => void;
  onClose: () => void;
}

const RebookingOptions: React.FC<RebookingOptionsProps> = ({
  originalFlight,
  alternativeFlights,
  onSelect,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-orange-50 border-b border-orange-100">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Flight Rebooking Options</h2>
          </div>
          <p className="text-gray-600">
            Select an alternative flight to rebook your journey
          </p>
        </div>

        {/* Original Flight */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Original Flight</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {originalFlight.itineraries[0].segments[0].carrierCode} 
                  {originalFlight.itineraries[0].segments[0].number}
                </div>
                <div className="text-sm text-gray-600">
                  {originalFlight.itineraries[0].segments[0].departure.iataCode} → 
                  {originalFlight.itineraries[0].segments[0].arrival.iataCode}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {new Date(originalFlight.itineraries[0].segments[0].departure.at).toLocaleTimeString()}
                </div>
                <div className="text-sm text-red-600">Delayed/Cancelled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Flights */}
        <div className="overflow-y-auto max-h-[50vh]">
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Available Alternatives</h3>
            
            {alternativeFlights.map((flight) => (
              <div
                key={flight.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => onSelect(flight)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <Plane className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {flight.itineraries[0].segments[0].carrierCode} 
                        {flight.itineraries[0].segments[0].number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {flight.itineraries[0].segments[0].departure.iataCode} → 
                        {flight.itineraries[0].segments[0].arrival.iataCode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-orange-500">
                      {flight.price.currency} {flight.price.total}
                    </div>
                    <div className="text-sm text-gray-600">
                      {flight.itineraries[0].duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {flight.price.base} {flight.price.currency} (Base fare)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Keep Original Flight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebookingOptions;