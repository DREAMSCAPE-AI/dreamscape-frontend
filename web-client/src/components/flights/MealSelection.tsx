import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { FlightOffer } from '../../services/api/types';
import { mealService, type MealOption } from '../../services/mealService';

interface MealSelectionProps {
  flight: FlightOffer;
  passengers: number;
  onBack: () => void;
  onContinue: (selectedMeals: SelectedMeal[]) => void;
}

export interface SelectedMeal {
  passengerId: number;
  segmentIndex: number;
  mealType: string;
  mealName: string;
  price: number;
  dietary: string[];
}

const MealSelection: React.FC<MealSelectionProps> = ({
  flight,
  passengers,
  onBack,
  onContinue
}) => {
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([]);
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [mealOptions, setMealOptions] = useState<MealOption[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load meal options from API
  useEffect(() => {
    const loadMealOptions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const optionsPromises = flight.itineraries[0].segments.map(async (segment) => {
          const duration = segment.duration ?? 'PT2H';
          const durationMatch = /PT(\d+)H(\d+)?M?/.exec(duration);
          const hours = parseInt(durationMatch?.[1] ?? '2');
          const minutes = parseInt(durationMatch?.[2] ?? '0');
          const totalMinutes = hours * 60 + minutes;
          
          // Only fetch meals for flights longer than 2 hours
          if (totalMinutes < 120) return [];

          const params = {
            airlineCode: segment.carrierCode,
            flightDuration: totalMinutes,
            departureCode: segment.departure.iataCode,
            arrivalCode: segment.arrival.iataCode,
            cabinClass: 'economy' // Could be dynamic based on booking class
          };

          return await mealService.getMealsForFlight(params);
        });

        const allOptions = await Promise.all(optionsPromises);
        setMealOptions(allOptions);
      } catch (err) {
        console.error('Failed to load meal options:', err);
        setError('Failed to load meal options. Please try again.');
        
        // Fallback to empty arrays for each segment
        setMealOptions(flight.itineraries[0].segments.map(() => []));
      } finally {
        setLoading(false);
      }
    };

    loadMealOptions();
  }, [flight]);

  const handleMealSelect = (meal: MealOption) => {
    const newSelection: SelectedMeal = {
      passengerId: currentPassenger,
      segmentIndex: currentSegment,
      mealType: meal.category,
      mealName: meal.name,
      price: meal.price,
      dietary: meal.dietary
    };

    setSelectedMeals(prev => [
      ...prev.filter(m => !(m.passengerId === currentPassenger && m.segmentIndex === currentSegment)),
      newSelection
    ]);
  };

  const getSelectedMeal = (passengerId: number, segmentIndex: number) => {
    return selectedMeals.find(m => m.passengerId === passengerId && m.segmentIndex === segmentIndex);
  };

  const totalPrice = selectedMeals.reduce((sum, meal) => sum + meal.price, 0);
  const currentSegmentInfo = flight.itineraries[0].segments[currentSegment];
  const currentMealOptions = mealOptions[currentSegment] || [];

  // Check if meals are available for this segment
  const mealsAvailable = currentMealOptions.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6">
        <h2 className="text-2xl font-bold">Select Your Meals</h2>
        <p className="mt-2 opacity-90">
          Choose meal preferences for passenger {currentPassenger + 1} of {passengers}
        </p>
      </div>

      <div className="p-6">
        {/* Flight Segment Selector */}
        {flight.itineraries[0].segments.length > 1 && (
          <div className="mb-6">
            <div className="flex space-x-2">
              {flight.itineraries[0].segments.map((segment, index) => (
                <button
                  key={`${segment.departure.iataCode}-${segment.arrival.iataCode}-${index}`}
                  onClick={() => setCurrentSegment(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentSegment === index
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {segment.departure.iataCode} → {segment.arrival.iataCode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Flight Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {currentSegmentInfo.departure.iataCode} → {currentSegmentInfo.arrival.iataCode}
              </h3>
              <p className="text-sm text-gray-600">
                {currentSegmentInfo.carrierCode} {currentSegmentInfo.number} • 
                Duration: {currentSegmentInfo.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
              </p>
            </div>
            {!mealsAvailable && (
              <div className="text-right">
                <p className="text-sm text-orange-600 font-medium">Short flight - no meal service</p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto text-gray-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
          </div>
        ) : mealsAvailable ? (
          <>
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

            {/* Meal Categories */}
            <div className="space-y-6">
              {/* Standard Meals */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Standard Meals (Included)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMealOptions.filter(meal => meal.category === 'standard').map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => handleMealSelect(meal)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors text-left w-full ${
                        getSelectedMeal(currentPassenger, currentSegment)?.mealName === meal.name
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{meal.name}</h4>
                        {meal.price > 0 && (
                          <span className="text-orange-600 font-semibold">+${meal.price}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                      {meal.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {meal.dietary.map((diet) => (
                            <span
                              key={diet}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {diet}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium Meals */}
              {currentMealOptions.some(meal => meal.category === 'premium') && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Premium Meals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMealOptions.filter(meal => meal.category === 'premium').map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => handleMealSelect(meal)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors text-left w-full ${
                          getSelectedMeal(currentPassenger, currentSegment)?.mealName === meal.name
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{meal.name}</h4>
                          <span className="text-orange-600 font-semibold">+${meal.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                        {meal.dietary.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {meal.dietary.map((diet) => (
                              <span
                                key={diet}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {diet}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Dietary Meals */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Special Dietary Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMealOptions.filter(meal => meal.category === 'special').map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => handleMealSelect(meal)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors text-left w-full ${
                        getSelectedMeal(currentPassenger, currentSegment)?.mealName === meal.name
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{meal.name}</h4>
                        {meal.price > 0 && (
                          <span className="text-orange-600 font-semibold">+${meal.price}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.dietary.map((diet) => (
                          <span
                            key={diet}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Meals Summary */}
            {selectedMeals.length > 0 && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold mb-2">Selected Meals</h4>
                <div className="space-y-2">
                  {selectedMeals.map((meal) => (
                    <div key={`${meal.passengerId}-${meal.segmentIndex}-${meal.mealName}`} className="flex justify-between text-sm">
                      <span>
                        Passenger {meal.passengerId + 1} - {meal.mealName}
                        {flight.itineraries[0].segments.length > 1 && ` (Segment ${meal.segmentIndex + 1})`}
                      </span>
                      <span className="font-medium">
                        {meal.price > 0 ? `+$${meal.price}` : 'Included'}
                      </span>
                    </div>
                  ))}
                  {totalPrice > 0 && (
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Meal Fees:</span>
                      <span>${totalPrice}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No meal service available for this short flight. Light snacks and beverages will be provided.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Seats
          </button>
          
          <button
            onClick={() => onContinue(selectedMeals)}
            className="flex items-center px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Continue to Baggage
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealSelection;
