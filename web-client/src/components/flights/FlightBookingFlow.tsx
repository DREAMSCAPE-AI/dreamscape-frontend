import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import FlightSearch from './FlightSearch';
import FlightResults from './FlightResults';
import FlightDetails from './FlightDetails';
import SeatSelection, { SelectedSeat } from './SeatSelection';
import MealSelection, { SelectedMeal } from './MealSelection';
import BaggageSelection, { SelectedBaggage } from './BaggageSelection';
import PassengerInfo from './PassengerInfo';
import ApiService from '@/services/api/APIService';
import type { FlightOffer, UIFlightSearchParams } from '@/services/api/types';

type BookingStep = 'search' | 'results' | 'details' | 'seats' | 'meals' | 'baggage' | 'passengers' | 'payment';

const FlightBookingFlow: React.FC = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([]);
  const [selectedBaggage, setSelectedBaggage] = useState<SelectedBaggage[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real flight search function using Amadeus API
  const handleSearch = async (params: UIFlightSearchParams) => {
    setLoading(true);
    setError(null);
    
    // Update passenger count from search params
    const totalPassengers = params.adults + (params.children || 0) + (params.infants || 0);
    setPassengerCount(totalPassengers);
    
    try {
      // Map UI params to API params
      const result = await ApiService.searchFlights({
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

      // Transform API response to our FlightOffer format
      const flights: FlightOffer[] = result?.map((offer: any) => {
        // Check if this is the simplified format from our backend
        if (offer.departure && offer.arrival && offer.airline) {
          // Transform simplified format to FlightOffer format
          return {
            id: offer.id,
            source: 'BACKEND',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: !params.returnDate,
            lastTicketingDate: offer.departure.time,
            numberOfBookableSeats: offer.availableSeats || 9,
            itineraries: [
              {
                duration: offer.duration,
                segments: [
                  {
                    departure: {
                      iataCode: offer.departure.airport,
                      terminal: offer.departure.terminal,
                      at: offer.departure.time
                    },
                    arrival: {
                      iataCode: offer.arrival.airport,
                      terminal: offer.arrival.terminal,
                      at: offer.arrival.time
                    },
                    carrierCode: offer.airline.code,
                    number: offer.id,
                    aircraft: {
                      code: 'UNKNOWN'
                    },
                    duration: offer.duration,
                    id: offer.id,
                    numberOfStops: offer.stops || 0,
                    blacklistedInEU: false
                  }
                ]
              }
            ],
            price: {
              currency: offer.price.currency,
              total: String(offer.price.total),
              base: String(offer.price.total),
              fees: [],
              grandTotal: String(offer.price.total)
            },
            pricingOptions: {
              fareType: [offer.cabinClass || 'ECONOMY'],
              includedCheckedBagsOnly: offer.baggageAllowance?.checkedBags === 0
            },
            validatingAirlineCodes: [offer.airline.code],
            travelerPricings: []
          } as FlightOffer;
        }

        // Otherwise, assume it's already in FlightOffer format (Amadeus direct response)
        return {
          id: offer.id,
          source: offer.source,
          instantTicketingRequired: offer.instantTicketingRequired,
          nonHomogeneous: offer.nonHomogeneous,
          oneWay: offer.oneWay,
          lastTicketingDate: offer.lastTicketingDate,
          numberOfBookableSeats: offer.numberOfBookableSeats,
          itineraries: offer.itineraries,
          price: offer.price,
          pricingOptions: offer.pricingOptions,
          validatingAirlineCodes: offer.validatingAirlineCodes,
          travelerPricings: offer.travelerPricings
        } as FlightOffer;
      })
      // Filter out invalid flights with missing or empty itineraries/segments
      .filter((flight: FlightOffer) => {
        return flight.itineraries &&
               flight.itineraries.length > 0 &&
               flight.itineraries[0].segments &&
               flight.itineraries[0].segments.length > 0;
      }) || [];

      setSearchResults(flights);
      setCurrentStep('results');
    } catch (error) {
      console.error('Flight search error:', error);
      setError(error instanceof Error ? error.message : 'Failed to search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSelect = (flight: FlightOffer) => {
    setSelectedFlight(flight);
    setCurrentStep('details');
  };

  const handleFlightAccept = () => {
    setCurrentStep('seats');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 'search', label: 'Search' },
              { step: 'results', label: 'Select Flight' },
              { step: 'seats', label: 'Choose Seats' },
              { step: 'meals', label: 'Select Meals' },
              { step: 'baggage', label: 'Add Baggage' },
              { step: 'passengers', label: 'Passenger Info' },
              { step: 'payment', label: 'Payment' }
            ].map(({ step, label }, index) => (
              <div
                key={step}
                className="flex items-center"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === step
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-600">
                  {label}
                </div>
                {index < 6 && (
                  <div className="w-16 h-0.5 mx-2 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'search' && (
            <FlightSearch
              onSearch={handleSearch}
              initialValues={location.state}
              loading={loading}
              error={error}
            />
          )}

          {currentStep === 'results' && (
            <div className="space-y-6">
              <FlightSearch
                onSearch={handleSearch}
                initialValues={location.state}
                loading={loading}
                error={error}
              />
              <FlightResults
                flights={searchResults}
                onSelect={handleFlightSelect}
              />
            </div>
          )}

          {currentStep === 'details' && selectedFlight && (
            <FlightDetails
              flight={selectedFlight}
              onClose={() => setCurrentStep('results')}
              onBack={() => setCurrentStep('results')}
              onAccept={handleFlightAccept}
            />
          )}

          {currentStep === 'seats' && selectedFlight && (
            <SeatSelection
              flight={selectedFlight}
              passengers={passengerCount}
              onBack={() => setCurrentStep('details')}
              onContinue={(seats) => {
                setSelectedSeats(seats);
                setCurrentStep('meals');
              }}
            />
          )}

          {currentStep === 'meals' && selectedFlight && (
            <MealSelection
              flight={selectedFlight}
              passengers={passengerCount}
              onBack={() => setCurrentStep('seats')}
              onContinue={(meals) => {
                setSelectedMeals(meals);
                setCurrentStep('baggage');
              }}
            />
          )}

          {currentStep === 'baggage' && selectedFlight && (
            <BaggageSelection
              passengers={passengerCount}
              onBack={() => setCurrentStep('meals')}
              onContinue={(baggage) => {
                setSelectedBaggage(baggage);
                setCurrentStep('passengers');
              }}
            />
          )}

          {currentStep === 'passengers' && selectedFlight && (
            <PassengerInfo
              flight={selectedFlight}
              onBack={() => setCurrentStep('baggage')}
              onContinue={(passengerDetails) => {
                console.log('Passenger details:', passengerDetails);
                console.log('Selected seats:', selectedSeats);
                console.log('Selected meals:', selectedMeals);
                console.log('Selected baggage:', selectedBaggage);
                setCurrentStep('payment');
              }}
            />
          )}

          {currentStep === 'payment' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Base Flight Price</span>
                  <span>${selectedFlight?.price.total || 0}</span>
                </div>
                
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span>Seat Selection Fees</span>
                    <span>+${selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}</span>
                  </div>
                )}
                
                {selectedMeals.length > 0 && (
                  <div className="flex justify-between">
                    <span>Meal Fees</span>
                    <span>+${selectedMeals.reduce((sum, meal) => sum + meal.price, 0)}</span>
                  </div>
                )}
                
                {selectedBaggage.length > 0 && (
                  <div className="flex justify-between">
                    <span>Baggage Fees</span>
                    <span>+${selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>
                    ${(
                      parseFloat(selectedFlight?.price.total || '0') +
                      selectedSeats.reduce((sum, seat) => sum + seat.price, 0) +
                      selectedMeals.reduce((sum, meal) => sum + meal.price, 0) +
                      selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mt-2">Payment implementation coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightBookingFlow;