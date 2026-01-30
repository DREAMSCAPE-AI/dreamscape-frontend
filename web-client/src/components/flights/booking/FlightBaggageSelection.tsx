/**
 * Flight Baggage Selection Component
 * Step 5 of flight booking workflow
 */

import { useFlightBookingStore } from '@/store/flightBookingStore';
import { Luggage, Plus, Minus, Check } from 'lucide-react';

// Mock baggage options
const BAGGAGE_OPTIONS = [
  {
    type: 'checked' as const,
    name: 'Checked Baggage',
    description: 'Standard checked bag (up to 23kg)',
    icon: '🧳',
    price: 30,
    maxQuantity: 3,
  },
  {
    type: 'cabin' as const,
    name: 'Extra Cabin Bag',
    description: 'Additional cabin bag (up to 10kg)',
    icon: '🎒',
    price: 15,
    maxQuantity: 2,
  },
  {
    type: 'sports' as const,
    name: 'Sports Equipment',
    description: 'Golf clubs, skis, surfboards, etc.',
    icon: '⛳',
    price: 50,
    maxQuantity: 2,
  },
];

export default function FlightBaggageSelection() {
  const {
    selectedFlight,
    passengers,
    baggage,
    addBaggageSelection,
    removeBaggageSelection,
  } = useFlightBookingStore();

  const getPassengerBaggage = (passengerId: string, type: string) => {
    return baggage.find((b) => b.passengerId === passengerId && b.type === type);
  };

  const handleQuantityChange = (passenger: any, baggageOption: any, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeBaggageSelection(passenger.id, baggageOption.type);
    } else if (newQuantity <= baggageOption.maxQuantity) {
      addBaggageSelection({
        passengerId: passenger.id,
        type: baggageOption.type,
        weight: baggageOption.type === 'checked' ? 23 : baggageOption.type === 'cabin' ? 10 : 20,
        quantity: newQuantity,
        price: baggageOption.price,
        currency: selectedFlight?.price?.currency || 'USD',
      });
    }
  };

  const getTotalBaggagePrice = () => {
    return baggage.reduce((sum, bag) => sum + bag.price * bag.quantity, 0);
  };

  const getTotalBaggageCount = () => {
    return baggage.reduce((sum, bag) => sum + bag.quantity, 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Baggage</h2>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Baggage Allowance</h3>
            <p className="text-sm text-blue-800">
              Each passenger includes one free personal item (purse, laptop bag). Additional baggage can be added below.
            </p>
          </div>
        </div>
      </div>

      {/* Baggage Selection by Passenger */}
      <div className="space-y-6">
        {passengers.map((passenger) => {
          const passengerBaggageTotal = baggage
            .filter((b) => b.passengerId === passenger.id)
            .reduce((sum, b) => sum + b.price * b.quantity, 0);

          return (
            <div
              key={passenger.id}
              className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {passenger.firstName || `Passenger ${passenger.id.split('-')[1]}`}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">{passenger.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Baggage Total:</p>
                  <p className="text-lg font-bold text-orange-600">
                    {selectedFlight?.price?.currency} {passengerBaggageTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Baggage Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BAGGAGE_OPTIONS.map((option) => {
                  const currentBaggage = getPassengerBaggage(passenger.id, option.type);
                  const currentQuantity = currentBaggage?.quantity || 0;

                  return (
                    <div
                      key={option.type}
                      className="bg-white rounded-lg border-2 border-gray-300 p-4"
                    >
                      <div className="text-center mb-3">
                        <div className="text-4xl mb-2">{option.icon}</div>
                        <h4 className="font-semibold text-gray-900 mb-1">{option.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                        <p className="text-sm font-bold text-orange-600">
                          {selectedFlight?.price?.currency} {option.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() =>
                            handleQuantityChange(passenger, option, currentQuantity - 1)
                          }
                          disabled={currentQuantity === 0}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>

                        <div className="w-12 text-center">
                          <span className="text-xl font-bold text-gray-900">{currentQuantity}</span>
                        </div>

                        <button
                          onClick={() =>
                            handleQuantityChange(passenger, option, currentQuantity + 1)
                          }
                          disabled={currentQuantity >= option.maxQuantity}
                          className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {currentQuantity > 0 && (
                        <div className="mt-3 text-center">
                          <p className="text-sm font-semibold text-orange-600">
                            Subtotal: {selectedFlight?.price?.currency}{' '}
                            {(option.price * currentQuantity).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Luggage className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-semibold text-gray-900">Total Baggage Cost</p>
              <p className="text-sm text-gray-600">
                {getTotalBaggageCount()} bag{getTotalBaggageCount() !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">
              {selectedFlight?.price?.currency} {getTotalBaggagePrice().toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Skip Option */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Baggage selection is optional. You can skip this step and travel with just a personal item.
        </p>
      </div>
    </div>
  );
}
