/**
 * Flight Meal Selection Component
 * Step 4 of flight booking workflow
 */

import { useState } from 'react';
import { useFlightBookingStore } from '@/store/flightBookingStore';
import { Check, Utensils } from 'lucide-react';

// Mock meal options
const MEAL_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Meal',
    description: 'Regular airline meal with vegetarian option',
    price: 0,
    image: '🍱',
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian Meal',
    description: 'Specially prepared vegetarian meal',
    price: 0,
    image: '🥗',
  },
  {
    id: 'vegan',
    name: 'Vegan Meal',
    description: 'Plant-based meal with no animal products',
    price: 5,
    image: '🥙',
  },
  {
    id: 'kosher',
    name: 'Kosher Meal',
    description: 'Prepared according to Jewish dietary laws',
    price: 10,
    image: '🍲',
  },
  {
    id: 'halal',
    name: 'Halal Meal',
    description: 'Prepared according to Islamic dietary laws',
    price: 10,
    image: '🍛',
  },
  {
    id: 'gluten-free',
    name: 'Gluten-Free Meal',
    description: 'Meal without gluten-containing ingredients',
    price: 8,
    image: '🥘',
  },
  {
    id: 'child',
    name: 'Child Meal',
    description: 'Kid-friendly meal options',
    price: 0,
    image: '🍕',
  },
  {
    id: 'premium',
    name: 'Premium Meal',
    description: 'Upgraded meal with premium ingredients',
    price: 25,
    image: '🍽️',
  },
];

export default function FlightMealSelection() {
  const {
    selectedFlight,
    passengers,
    meals,
    addMealSelection,
    removeMealSelection,
  } = useFlightBookingStore();

  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const segments = selectedFlight?.itineraries?.[0]?.segments || [];
  const currentSegment = segments[selectedSegmentIndex];

  const getPassengerMeal = (passengerId: string) => {
    const meal = meals.find(
      (m) =>
        m.passengerId === passengerId &&
        m.segmentId === (currentSegment?.id || `segment-${selectedSegmentIndex}`)
    );
    return meal;
  };

  const handleMealSelect = (passenger: any, meal: any) => {
    const segmentId = currentSegment?.id || `segment-${selectedSegmentIndex}`;
    const existingMeal = getPassengerMeal(passenger.id);

    if (existingMeal && existingMeal.mealType === meal.id) {
      // Deselect if clicking the same meal
      removeMealSelection(segmentId, passenger.id);
    } else {
      // Select new meal
      addMealSelection({
        segmentId,
        passengerId: passenger.id,
        mealType: meal.id,
        mealName: meal.name,
        price: meal.price,
        currency: selectedFlight?.price?.currency || 'USD',
      });
    }
  };

  const getTotalMealPrice = () => {
    return meals.reduce((sum, meal) => sum + meal.price, 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Meals</h2>

      {/* Segment Selector */}
      {segments.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Flight Segment</h3>
          <div className="flex gap-3">
            {segments.map((segment: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedSegmentIndex(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSegmentIndex === index
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {segment.departure?.iataCode || 'DEP'} → {segment.arrival?.iataCode || 'ARR'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meal Selection by Passenger */}
      <div className="space-y-6">
        {passengers.map((passenger) => {
          const selectedMeal = getPassengerMeal(passenger.id);

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
                {selectedMeal && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Selected:</p>
                    <p className="text-lg font-bold text-orange-600">{selectedMeal.mealName}</p>
                    {selectedMeal.price > 0 && (
                      <p className="text-sm text-gray-600">
                        +{selectedFlight?.price?.currency} {selectedMeal.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Meal Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MEAL_OPTIONS.map((meal) => {
                  const isSelected = selectedMeal?.mealType === meal.id;

                  return (
                    <button
                      key={meal.id}
                      onClick={() => handleMealSelect(passenger, meal)}
                      className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-orange-500 bg-orange-100 shadow-md'
                          : 'border-gray-300 bg-white hover:border-orange-300 hover:shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-orange-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="text-4xl mb-2">{meal.image}</div>
                      <h4 className="font-semibold text-gray-900 mb-1">{meal.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{meal.description}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            meal.price === 0 ? 'text-green-600' : 'text-orange-600'
                          }`}
                        >
                          {meal.price === 0
                            ? 'Included'
                            : `+${selectedFlight?.price?.currency} ${meal.price.toFixed(2)}`}
                        </span>
                      </div>
                    </button>
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
            <Utensils className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-semibold text-gray-900">Total Meal Cost</p>
              <p className="text-sm text-gray-600">
                {meals.length} meal{meals.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">
              {selectedFlight?.price?.currency} {getTotalMealPrice().toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Skip Option */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Meal selection is optional. Standard meals will be provided if you skip this step.
        </p>
      </div>
    </div>
  );
}
