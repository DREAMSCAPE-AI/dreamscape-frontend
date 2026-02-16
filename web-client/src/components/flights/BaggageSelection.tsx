import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

interface BaggageSelectionProps {
  passengers: number;
  hasReturnFlight?: boolean;
  onBack: () => void;
  onContinue: (selectedBaggage: SelectedBaggage[], returnSelectedBaggage?: SelectedBaggage[]) => void;
}

export interface SelectedBaggage {
  passengerId: number;
  type: 'checked' | 'carry-on' | 'personal' | 'sports' | 'oversized';
  weight: number;
  quantity: number;
  price: number;
  description: string;
}

interface BaggageOption {
  id: string;
  type: 'checked' | 'carry-on' | 'personal' | 'sports' | 'oversized';
  name: string;
  description: string;
  weight: number;
  dimensions?: string;
  price: number;
  included: boolean;
  maxQuantity: number;
  icon: string;
}

const BaggageSelection: React.FC<BaggageSelectionProps> = ({
  passengers,
  hasReturnFlight,
  onBack,
  onContinue
}) => {
  const [selectedBaggage, setSelectedBaggage] = useState<SelectedBaggage[]>([]);
  const [returnSelectedBaggage, setReturnSelectedBaggage] = useState<SelectedBaggage[]>([]);
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [isSelectingReturnBaggage, setIsSelectingReturnBaggage] = useState(false);

  // Generate baggage options based on flight class and airline
  const baggageOptions: BaggageOption[] = [
    {
      id: 'personal-item',
      type: 'personal',
      name: 'Personal Item',
      description: 'Small bag that fits under the seat (purse, laptop bag)',
      weight: 5,
      dimensions: '40 x 30 x 15 cm',
      price: 0,
      included: true,
      maxQuantity: 1,
      icon: '👜'
    },
    {
      id: 'carry-on',
      type: 'carry-on',
      name: 'Carry-on Bag',
      description: 'Standard carry-on bag for overhead compartment',
      weight: 10,
      dimensions: '55 x 40 x 23 cm',
      price: 0,
      included: true,
      maxQuantity: 1,
      icon: '🧳'
    },
    {
      id: 'checked-23kg',
      type: 'checked',
      name: 'Checked Bag (23kg)',
      description: 'Standard checked baggage up to 23kg',
      weight: 23,
      dimensions: '158 cm total',
      price: 50,
      included: false,
      maxQuantity: 3,
      icon: '🎒'
    },
    {
      id: 'checked-32kg',
      type: 'checked',
      name: 'Heavy Checked Bag (32kg)',
      description: 'Heavy checked baggage up to 32kg',
      weight: 32,
      dimensions: '158 cm total',
      price: 100,
      included: false,
      maxQuantity: 2,
      icon: '🎒'
    },
    {
      id: 'extra-carry-on',
      type: 'carry-on',
      name: 'Additional Carry-on',
      description: 'Extra carry-on bag (subject to space availability)',
      weight: 10,
      dimensions: '55 x 40 x 23 cm',
      price: 35,
      included: false,
      maxQuantity: 1,
      icon: '🧳'
    },
    {
      id: 'sports-equipment',
      type: 'sports',
      name: 'Sports Equipment',
      description: 'Golf clubs, skis, surfboards, bicycles',
      weight: 23,
      dimensions: 'Varies by equipment',
      price: 150,
      included: false,
      maxQuantity: 2,
      icon: '🏌️'
    },
    {
      id: 'oversized',
      type: 'oversized',
      name: 'Oversized Baggage',
      description: 'Musical instruments, artwork, large items',
      weight: 32,
      dimensions: 'Over 158 cm total',
      price: 200,
      included: false,
      maxQuantity: 1,
      icon: '🎻'
    }
  ];

  const getBaggageQuantity = (passengerId: number, baggageId: string): number => {
    const activeBaggage = isSelectingReturnBaggage ? returnSelectedBaggage : selectedBaggage;
    const baggage = activeBaggage.find(
      b => b.passengerId === passengerId && b.description === baggageOptions.find(opt => opt.id === baggageId)?.description
    );
    return baggage?.quantity ?? 0;
  };

  const updateBaggageQuantity = (option: BaggageOption, quantity: number) => {
    if (quantity < 0 || quantity > option.maxQuantity) return;

    const setActiveBaggage = isSelectingReturnBaggage ? setReturnSelectedBaggage : setSelectedBaggage;
    const activeBaggage = isSelectingReturnBaggage ? returnSelectedBaggage : selectedBaggage;

    const existingIndex = activeBaggage.findIndex(
      b => b.passengerId === currentPassenger && b.description === option.description
    );

    if (quantity === 0) {
      // Remove baggage if quantity is 0
      if (existingIndex !== -1) {
        setActiveBaggage(prev => prev.filter((_, index) => index !== existingIndex));
      }
    } else {
      const newBaggage: SelectedBaggage = {
        passengerId: currentPassenger,
        type: option.type,
        weight: option.weight,
        quantity,
        price: option.price * quantity,
        description: option.description
      };

      if (existingIndex !== -1) {
        // Update existing baggage
        setActiveBaggage(prev => prev.map((item, index) =>
          index === existingIndex ? newBaggage : item
        ));
      } else {
        // Add new baggage
        setActiveBaggage(prev => [...prev, newBaggage]);
      }
    }
  };

  const handleContinue = () => {
    if (hasReturnFlight && !isSelectingReturnBaggage) {
      // Switch to return flight baggage selection
      setIsSelectingReturnBaggage(true);
      setCurrentPassenger(0);
    } else {
      // Proceed to next step
      onContinue(selectedBaggage, hasReturnFlight ? returnSelectedBaggage : undefined);
    }
  };

  const getTotalPrice = () => {
    return selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0) +
           returnSelectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0);
  };

  const getTotalWeight = (passengerId: number) => {
    const activeBaggage = isSelectingReturnBaggage ? returnSelectedBaggage : selectedBaggage;
    return activeBaggage
      .filter(b => b.passengerId === passengerId)
      .reduce((sum, baggage) => sum + (baggage.weight * baggage.quantity), 0);
  };

  const getIncludedBaggage = () => {
    return baggageOptions.filter(option => option.included);
  };

  const getAdditionalBaggage = () => {
    return baggageOptions.filter(option => !option.included);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 md:p-6">
        <h2 className="text-lg md:text-2xl font-bold">
          {isSelectingReturnBaggage ? 'Manage Your Return Flight Baggage' : 'Manage Your Baggage'}
        </h2>
        <p className="mt-1 md:mt-2 text-sm md:text-base opacity-90">
          Add extra baggage for passenger {currentPassenger + 1} of {passengers}
        </p>
      </div>

      <div className="p-4 md:p-6">
        {/* Round-trip flight indicator */}
        {hasReturnFlight && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex gap-2">
                  <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium ${!isSelectingReturnBaggage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                    Vol aller
                  </div>
                  <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium ${isSelectingReturnBaggage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                    Vol retour
                  </div>
                </div>
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                {isSelectingReturnBaggage ? 'Sélectionnez vos bagages pour le vol retour' : 'Sélectionnez vos bagages pour le vol aller'}
              </div>
            </div>
          </div>
        )}

        {/* Passenger Selector */}
        <div className="mb-4 md:mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {Array.from({ length: passengers }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPassenger(index)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  currentPassenger === index
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Passenger {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Current Passenger Summary */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
            <div>
              <h3 className="text-sm md:text-base font-semibold">Passenger {currentPassenger + 1} Baggage Summary</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Total Weight: {getTotalWeight(currentPassenger)}kg
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs md:text-sm text-gray-600">Additional Fees</p>
              <p className="font-semibold text-base md:text-lg">
                ${(isSelectingReturnBaggage ? returnSelectedBaggage : selectedBaggage).filter(b => b.passengerId === currentPassenger).reduce((sum, b) => sum + b.price, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Included Baggage */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-green-600">✓ Included in Your Ticket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {getIncludedBaggage().map((option) => (
              <div key={option.id} className="p-3 md:p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 md:gap-0">
                    <span className="text-xl md:text-2xl mr-2 md:mr-3 flex-shrink-0">{option.icon}</span>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-green-800">{option.name}</h4>
                      <p className="text-xs md:text-sm text-green-700">{option.description}</p>
                    </div>
                  </div>
                  <span className="text-green-600 text-xs md:text-sm font-semibold flex-shrink-0 ml-2">FREE</span>
                </div>
                <div className="text-xs text-green-600">
                  <p>Weight: Up to {option.weight}kg</p>
                  {option.dimensions && <p>Dimensions: {option.dimensions}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Baggage */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Additional Baggage Options</h3>
          <div className="space-y-3 md:space-y-4">
            {getAdditionalBaggage().map((option) => {
              const currentQuantity = getBaggageQuantity(currentPassenger, option.id);
              return (
                <div key={option.id} className="p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <div className="flex items-start flex-1">
                      <span className="text-xl md:text-2xl mr-2 md:mr-3 flex-shrink-0">{option.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm md:text-base font-semibold">{option.name}</h4>
                        <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">{option.description}</p>
                        <div className="text-xs text-gray-500">
                          <p>Weight: Up to {option.weight}kg</p>
                          {option.dimensions && <p>Dimensions: {option.dimensions}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end md:space-x-4">
                      <div className="text-left md:text-right">
                        <p className="text-sm md:text-base font-semibold text-orange-600">${option.price}</p>
                        <p className="text-xs text-gray-500">per item</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateBaggageQuantity(option, currentQuantity - 1)}
                          disabled={currentQuantity === 0}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3 md:w-4 md:h-4" />
                        </button>

                        <span className="w-6 md:w-8 text-center text-sm md:text-base font-semibold">{currentQuantity}</span>

                        <button
                          onClick={() => updateBaggageQuantity(option, currentQuantity + 1)}
                          disabled={currentQuantity >= option.maxQuantity}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {currentQuantity > 0 && (
                    <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span>Quantity: {currentQuantity}</span>
                        <span className="font-semibold">Total: ${option.price * currentQuantity}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* All Passengers Summary */}
        {(selectedBaggage.length > 0 || returnSelectedBaggage.length > 0) && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-orange-50 rounded-lg">
            <h4 className="text-sm md:text-base font-semibold mb-2 md:mb-3">Baggage Summary - All Passengers</h4>
            <div className="space-y-2">
              {selectedBaggage.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-orange-700 uppercase mt-2">Outbound Flight</div>
                  {Array.from({ length: passengers }, (_, passengerIndex) => {
                    const passengerBaggage = selectedBaggage.filter(b => b.passengerId === passengerIndex);
                    if (passengerBaggage.length === 0) return null;

                    return (
                      <div key={`outbound-passenger-${passengerIndex}`} className="border-b border-orange-200 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                        <h5 className="font-medium text-sm mb-1">Passenger {passengerIndex + 1}</h5>
                        {passengerBaggage.map((baggage, index) => (
                          <div key={`outbound-${passengerIndex}-${baggage.description}-${index}`} className="flex justify-between text-sm text-gray-700">
                            <span>{baggage.description} x{baggage.quantity}</span>
                            <span>${baggage.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
              {returnSelectedBaggage.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-orange-700 uppercase mt-2">Return Flight</div>
                  {Array.from({ length: passengers }, (_, passengerIndex) => {
                    const passengerBaggage = returnSelectedBaggage.filter(b => b.passengerId === passengerIndex);
                    if (passengerBaggage.length === 0) return null;

                    return (
                      <div key={`return-passenger-${passengerIndex}`} className="border-b border-orange-200 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                        <h5 className="font-medium text-sm mb-1">Passenger {passengerIndex + 1}</h5>
                        {passengerBaggage.map((baggage, index) => (
                          <div key={`return-${passengerIndex}-${baggage.description}-${index}`} className="flex justify-between text-sm text-gray-700">
                            <span>{baggage.description} x{baggage.quantity}</span>
                            <span>${baggage.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}

              <div className="border-t border-orange-300 pt-2 flex justify-between font-semibold">
                <span>Total Baggage Fees:</span>
                <span>${getTotalPrice()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Important Information */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm md:text-base font-semibold text-blue-800 mb-2">Important Baggage Information</h4>
          <ul className="text-xs md:text-sm text-blue-700 space-y-1">
            <li>• Baggage fees are per direction and per passenger</li>
            <li>• Weight limits are strictly enforced - excess weight charges apply</li>
            <li>• Sports equipment must be properly packed in appropriate cases</li>
            <li>• Liquids in carry-on bags must comply with 3-1-1 rule</li>
            <li>• Prohibited items will be confiscated at security checkpoints</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-0">
          <button
            onClick={onBack}
            className="flex items-center justify-center md:justify-start px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base text-gray-600 hover:text-gray-800 transition-colors order-2 md:order-1"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            Back to Meals
          </button>

          <button
            onClick={handleContinue}
            className="flex items-center justify-center px-4 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors order-1 md:order-2"
          >
            <span className="text-center">{hasReturnFlight && !isSelectingReturnBaggage ? 'Continue to Return Flight Baggage' : 'Continue to Passenger Info'}</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaggageSelection;
