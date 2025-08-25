import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

interface BaggageSelectionProps {
  passengers: number;
  onBack: () => void;
  onContinue: (selectedBaggage: SelectedBaggage[]) => void;
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
  onBack,
  onContinue
}) => {
  const [selectedBaggage, setSelectedBaggage] = useState<SelectedBaggage[]>([]);
  const [currentPassenger, setCurrentPassenger] = useState(0);

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
    const baggage = selectedBaggage.find(
      b => b.passengerId === passengerId && b.description === baggageOptions.find(opt => opt.id === baggageId)?.description
    );
    return baggage?.quantity ?? 0;
  };

  const updateBaggageQuantity = (option: BaggageOption, quantity: number) => {
    if (quantity < 0 || quantity > option.maxQuantity) return;

    const existingIndex = selectedBaggage.findIndex(
      b => b.passengerId === currentPassenger && b.description === option.description
    );

    if (quantity === 0) {
      // Remove baggage if quantity is 0
      if (existingIndex !== -1) {
        setSelectedBaggage(prev => prev.filter((_, index) => index !== existingIndex));
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
        setSelectedBaggage(prev => prev.map((item, index) => 
          index === existingIndex ? newBaggage : item
        ));
      } else {
        // Add new baggage
        setSelectedBaggage(prev => [...prev, newBaggage]);
      }
    }
  };

  const getTotalPrice = () => {
    return selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0);
  };

  const getTotalWeight = (passengerId: number) => {
    return selectedBaggage
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
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6">
        <h2 className="text-2xl font-bold">Manage Your Baggage</h2>
        <p className="mt-2 opacity-90">
          Add extra baggage for passenger {currentPassenger + 1} of {passengers}
        </p>
      </div>

      <div className="p-6">
        {/* Passenger Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {Array.from({ length: passengers }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPassenger(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Passenger {currentPassenger + 1} Baggage Summary</h3>
              <p className="text-sm text-gray-600">
                Total Weight: {getTotalWeight(currentPassenger)}kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Additional Fees</p>
              <p className="font-semibold text-lg">
                ${selectedBaggage.filter(b => b.passengerId === currentPassenger).reduce((sum, b) => sum + b.price, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Included Baggage */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-green-600">✓ Included in Your Ticket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getIncludedBaggage().map((option) => (
              <div key={option.id} className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <div>
                      <h4 className="font-semibold text-green-800">{option.name}</h4>
                      <p className="text-sm text-green-700">{option.description}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">FREE</span>
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Additional Baggage Options</h3>
          <div className="space-y-4">
            {getAdditionalBaggage().map((option) => {
              const currentQuantity = getBaggageQuantity(currentPassenger, option.id);
              return (
                <div key={option.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start flex-1">
                      <span className="text-2xl mr-3">{option.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold">{option.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                        <div className="text-xs text-gray-500">
                          <p>Weight: Up to {option.weight}kg</p>
                          {option.dimensions && <p>Dimensions: {option.dimensions}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">${option.price}</p>
                        <p className="text-xs text-gray-500">per item</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateBaggageQuantity(option, currentQuantity - 1)}
                          disabled={currentQuantity === 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-semibold">{currentQuantity}</span>
                        
                        <button
                          onClick={() => updateBaggageQuantity(option, currentQuantity + 1)}
                          disabled={currentQuantity >= option.maxQuantity}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {currentQuantity > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
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
        {selectedBaggage.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold mb-3">Baggage Summary - All Passengers</h4>
            <div className="space-y-2">
              {Array.from({ length: passengers }, (_, passengerIndex) => {
                const passengerBaggage = selectedBaggage.filter(b => b.passengerId === passengerIndex);
                if (passengerBaggage.length === 0) return null;
                
                return (
                  <div key={`passenger-${passengerIndex}`} className="border-b border-orange-200 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                    <h5 className="font-medium text-sm mb-1">Passenger {passengerIndex + 1}</h5>
                    {passengerBaggage.map((baggage, index) => (
                      <div key={`${passengerIndex}-${baggage.description}-${index}`} className="flex justify-between text-sm text-gray-700">
                        <span>{baggage.description} x{baggage.quantity}</span>
                        <span>${baggage.price}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              
              <div className="border-t border-orange-300 pt-2 flex justify-between font-semibold">
                <span>Total Baggage Fees:</span>
                <span>${getTotalPrice()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Important Information */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Important Baggage Information</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Baggage fees are per direction and per passenger</li>
            <li>• Weight limits are strictly enforced - excess weight charges apply</li>
            <li>• Sports equipment must be properly packed in appropriate cases</li>
            <li>• Liquids in carry-on bags must comply with 3-1-1 rule</li>
            <li>• Prohibited items will be confiscated at security checkpoints</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Meals
          </button>
          
          <button
            onClick={() => onContinue(selectedBaggage)}
            className="flex items-center px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Continue to Passenger Info
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaggageSelection;
