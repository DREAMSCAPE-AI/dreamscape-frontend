import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FlightSearch from './FlightSearch';
import FlightResults from './FlightResults';
import FlightResultsToolbar from './FlightResultsToolbar';
import FlightDetails from './FlightDetails';
import SeatSelection, { SelectedSeat } from './SeatSelection';
import MealSelection, { SelectedMeal } from './MealSelection';
import BaggageSelection, { SelectedBaggage } from './BaggageSelection';
import PassengerInfo from './PassengerInfo';
import voyageService from '@/services/api/VoyageService';
import type { FlightOffer, UIFlightSearchParams } from '@/services/api/types';
import type { SortOption, FilterState, PaginationState } from '@/types/flights';
import {
  getFlightPrice,
  getDepartureTime,
  getNumberOfStops,
  parseDuration,
  isInPriceRange,
  isInDepartureTimeRange,
  matchesStopsFilter
} from '@/utils/flightUtils';
import { useFlightBookingStore } from '@/store/flightBookingStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/services/auth/AuthService';

type BookingStep = 'search' | 'results' | 'details' | 'seats' | 'meals' | 'baggage' | 'passengers' | 'payment';

const FlightBookingFlow: React.FC = () => {
  const { t } = useTranslation('flights');
  const location = useLocation();
  const navigate = useNavigate();
  const { setSelectedFlight: setFlightInStore } = useFlightBookingStore();
  const { addToCart, openDrawer, checkout } = useCartStore();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<FlightOffer | null>(null);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isSelectingReturnFlight, setIsSelectingReturnFlight] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([]);
  const [selectedBaggage, setSelectedBaggage] = useState<SelectedBaggage[]>([]);
  const [passengerInfo, setPassengerInfo] = useState<any[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting, Filtering, and Pagination State
  const [sortOption, setSortOption] = useState<SortOption>('departure-asc');
  const [filters, setFilters] = useState<FilterState>({
    priceMin: undefined,
    priceMax: undefined,
    stops: [],
    departureTimeRanges: []
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    pageSize: 10,
    hasMore: false
  });
  const [filteredAndSortedResults, setFilteredAndSortedResults] = useState<FlightOffer[]>([]);
  const [displayedResults, setDisplayedResults] = useState<FlightOffer[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper Functions for Filtering and Sorting
  const applyFilters = (flights: FlightOffer[], currentFilters: FilterState): FlightOffer[] => {
    return flights.filter(flight => {
      // Price filter
      const price = getFlightPrice(flight);
      if (!isInPriceRange(price, currentFilters.priceMin, currentFilters.priceMax)) {
        return false;
      }

      // Stops filter (only if filter is active)
      if (currentFilters.stops.length > 0) {
        const stops = getNumberOfStops(flight);
        if (!matchesStopsFilter(stops, currentFilters.stops)) {
          return false;
        }
      }

      // Departure time filter (only if filter is active)
      if (currentFilters.departureTimeRanges.length > 0) {
        const departureTime = getDepartureTime(flight);
        if (!isInDepartureTimeRange(departureTime, currentFilters.departureTimeRanges)) {
          return false;
        }
      }

      return true;
    });
  };

  const applySorting = (flights: FlightOffer[], currentSortOption: SortOption): FlightOffer[] => {
    const sorted = [...flights]; // Create copy to avoid mutating original

    switch (currentSortOption) {
      case 'departure-asc':
        return sorted.sort((a, b) =>
          getDepartureTime(a).getTime() - getDepartureTime(b).getTime()
        );

      case 'departure-desc':
        return sorted.sort((a, b) =>
          getDepartureTime(b).getTime() - getDepartureTime(a).getTime()
        );

      case 'price-asc':
        return sorted.sort((a, b) =>
          getFlightPrice(a) - getFlightPrice(b)
        );

      case 'price-desc':
        return sorted.sort((a, b) =>
          getFlightPrice(b) - getFlightPrice(a)
        );

      case 'duration-asc':
        return sorted.sort((a, b) => {
          const durationA = parseDuration(a.itineraries[0].duration);
          const durationB = parseDuration(b.itineraries[0].duration);
          return durationA - durationB;
        });

      case 'duration-desc':
        return sorted.sort((a, b) => {
          const durationA = parseDuration(a.itineraries[0].duration);
          const durationB = parseDuration(b.itineraries[0].duration);
          return durationB - durationA;
        });

      default:
        return sorted;
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);

    // Simulate 1-2 second delay for UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPagination(prev => ({
      ...prev,
      currentPage: prev.currentPage + 1
    }));

    setLoadingMore(false);
  };

  const handleResetFilters = () => {
    setFilters({
      priceMin: undefined,
      priceMax: undefined,
      stops: [],
      departureTimeRanges: []
    });
  };

  // Effect 1: Apply filters and sorting when dependencies change
  useEffect(() => {
    if (searchResults.length === 0) {
      setFilteredAndSortedResults([]);
      setDisplayedResults([]);
      return;
    }

    // Step 1: Apply filters
    const filtered = applyFilters(searchResults, filters);

    // Step 2: Apply sorting
    const sorted = applySorting(filtered, sortOption);

    // Step 3: Update filtered/sorted results
    setFilteredAndSortedResults(sorted);

    // Step 4: Reset pagination to page 0 when filters or sort changes
    setPagination({ currentPage: 0, pageSize: 10, hasMore: sorted.length > 10 });
  }, [searchResults, filters, sortOption]);

  // Effect 2: Update displayed results when pagination changes
  useEffect(() => {
    const startIndex = 0;
    const endIndex = (pagination.currentPage + 1) * pagination.pageSize;
    const displayed = filteredAndSortedResults.slice(startIndex, endIndex);

    setDisplayedResults(displayed);

    // Update hasMore flag
    setPagination(prev => ({
      ...prev,
      hasMore: endIndex < filteredAndSortedResults.length
    }));
  }, [filteredAndSortedResults, pagination.currentPage, pagination.pageSize]);

  // Real flight search function using Amadeus API
  const handleSearch = async (params: UIFlightSearchParams) => {
    // Detect if this is a round-trip search
    const roundTrip = !!(params.returnDate);
    setIsRoundTrip(roundTrip);
    setIsSelectingReturnFlight(false);
    setSelectedFlight(null);
    setSelectedReturnFlight(null);

    // Reset filters and sort to defaults on new search
    setSortOption('departure-asc');
    setFilters({
      priceMin: undefined,
      priceMax: undefined,
      stops: [],
      departureTimeRanges: []
    });
    setPagination({ currentPage: 0, pageSize: 10, hasMore: false });

    setLoading(true);
    setError(null);

    // Update passenger count from search params
    const totalPassengers = params.adults + (params.children || 0) + (params.infants || 0);
    setPassengerCount(totalPassengers);
    
    try {
      // Map UI params to API params
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

      // Transform API response to our FlightOffer format
      const flights: FlightOffer[] = result?.data.map((offer: any) => {
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
                      code: offer.aircraft || ''
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
            travelerPricings: [
              {
                travelerId: '1',
                fareOption: 'STANDARD',
                travelerType: 'ADULT',
                price: {
                  currency: offer.price.currency,
                  total: String(offer.price.total),
                  base: String(offer.price.total),
                  fees: [],
                  grandTotal: String(offer.price.total)
                },
                fareDetailsBySegment: [
                  {
                    segmentId: offer.id,
                    cabin: offer.cabinClass || 'ECONOMY',
                    fareBasis: 'STANDARD',
                    class: 'Y',
                    includedCheckedBags: {
                      quantity: offer.baggageAllowance?.checkedBags || 0
                    }
                  }
                ]
              }
            ]
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
    // First, show flight details
    if (isRoundTrip && !isSelectingReturnFlight) {
      // For round-trip: selecting outbound flight
      setSelectedFlight(flight);
      setCurrentStep('details');
    } else if (isRoundTrip && isSelectingReturnFlight) {
      // For round-trip: selecting return flight
      setSelectedReturnFlight(flight);
      setCurrentStep('details');
    } else {
      // For one-way: just selecting the flight
      setSelectedFlight(flight);
      setCurrentStep('details');
    }
  };

  const handleFlightAccept = () => {
    if (isRoundTrip && !isSelectingReturnFlight && !selectedReturnFlight) {
      // Round-trip: outbound flight accepted, now select return flight
      setIsSelectingReturnFlight(true);
      setCurrentStep('results');
    } else {
      // Either one-way, or round-trip with both flights selected
      setCurrentStep('seats');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-4 md:mb-8">
          {/* Mobile: Horizontal scroll */}
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 pb-2">
            <div className="flex items-center gap-3 md:gap-4 md:justify-between min-w-max md:min-w-0">
              {[
                { step: 'search', label: t('bookingFlow.steps.search') },
                { step: 'results', label: t('bookingFlow.steps.selectFlight') },
                { step: 'seats', label: t('bookingFlow.steps.chooseSeats') },
                { step: 'meals', label: t('bookingFlow.steps.selectMeals') },
                { step: 'baggage', label: t('bookingFlow.steps.addBaggage') },
                { step: 'passengers', label: t('bookingFlow.steps.passengerInfo') },
                { step: 'payment', label: t('bookingFlow.steps.payment') }
              ].map(({ step, label }, index) => (
                <div
                  key={step}
                  className="flex items-center flex-shrink-0"
                >
                  <div className={`flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-semibold ${
                    currentStep === step
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-2 text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">
                    {label}
                  </div>
                  {index < 6 && (
                    <div className="w-12 md:w-16 h-0.5 mx-2 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
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
              {/* Round-trip indicator */}
              {isRoundTrip && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isSelectingReturnFlight ? (
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-blue-900 font-semibold">
                        {isSelectingReturnFlight
                          ? t('roundTripIndicator.return')
                          : t('roundTripIndicator.outbound')}
                      </p>
                      {selectedFlight && isSelectingReturnFlight && (
                        <p className="text-blue-700 text-sm">
                          {t('roundTripIndicator.outboundSelected')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <FlightResultsToolbar
                sortOption={sortOption}
                onSortChange={setSortOption}
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={handleResetFilters}
                totalResults={filteredAndSortedResults.length}
              />
              <FlightResults
                flights={displayedResults}
                onSelect={handleFlightSelect}
                totalResults={filteredAndSortedResults.length}
                hasMore={pagination.hasMore}
                onLoadMore={handleLoadMore}
                loadingMore={loadingMore}
              />
            </div>
          )}

          {currentStep === 'details' && (
            <FlightDetails
              flight={isSelectingReturnFlight && selectedReturnFlight ? selectedReturnFlight : selectedFlight!}
              onClose={() => setCurrentStep('results')}
              onBack={() => setCurrentStep('results')}
              onAccept={handleFlightAccept}
            />
          )}

          {currentStep === 'seats' && selectedFlight && (
            <SeatSelection
              flight={selectedFlight}
              returnFlight={selectedReturnFlight}
              passengers={passengerCount}
              onBack={() => setCurrentStep('details')}
              onContinue={(seats, returnSeats) => {
                setSelectedSeats(seats);
                // TODO: Store return seats when implemented
                setCurrentStep('meals');
              }}
            />
          )}

          {currentStep === 'meals' && selectedFlight && (
            <MealSelection
              flight={selectedFlight}
              returnFlight={selectedReturnFlight}
              passengers={passengerCount}
              onBack={() => setCurrentStep('seats')}
              onContinue={(meals, returnMeals) => {
                setSelectedMeals(meals);
                // TODO: Store return meals when implemented
                setCurrentStep('baggage');
              }}
            />
          )}

          {currentStep === 'baggage' && selectedFlight && (
            <BaggageSelection
              passengers={passengerCount}
              hasReturnFlight={!!selectedReturnFlight}
              onBack={() => setCurrentStep('meals')}
              onContinue={(baggage, returnBaggage) => {
                setSelectedBaggage(baggage);
                // TODO: Store return baggage when implemented
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
                setPassengerInfo(passengerDetails);
                setCurrentStep('payment');
              }}
            />
          )}

          {currentStep === 'payment' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">{t('payment.title')}</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>{t('payment.baseFlightPrice')}</span>
                  <span>${selectedFlight?.price.total || 0}</span>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span>{t('payment.seatFees')}</span>
                    <span>+${selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}</span>
                  </div>
                )}

                {selectedMeals.length > 0 && (
                  <div className="flex justify-between">
                    <span>{t('payment.mealFees')}</span>
                    <span>+${selectedMeals.reduce((sum, meal) => sum + meal.price, 0)}</span>
                  </div>
                )}

                {selectedBaggage.length > 0 && (
                  <div className="flex justify-between">
                    <span>{t('payment.baggageFees')}</span>
                    <span>+${selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0)}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>{t('payment.totalAmount')}</span>
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

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                {/* Add to Cart Button */}
                <button
                  onClick={async () => {
                    if (!selectedFlight) return;
                    try {
                      const totalPrice = parseFloat(selectedFlight.price.total || '0') +
                        selectedSeats.reduce((sum, seat) => sum + seat.price, 0) +
                        selectedMeals.reduce((sum, meal) => sum + meal.price, 0) +
                        selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0);

                      const firstSegment = selectedFlight.itineraries?.[0]?.segments?.[0];
                      const lastSegment = selectedFlight.itineraries?.[0]?.segments?.[selectedFlight.itineraries[0].segments.length - 1];

                      await addToCart({
                        userId: userId,
                        type: 'FLIGHT',
                        itemId: selectedFlight.id,
                        itemData: {
                          ...selectedFlight,
                          origin: firstSegment?.departure?.iataCode,
                          destination: lastSegment?.arrival?.iataCode,
                          departureDate: firstSegment?.departure?.at,
                          arrivalDate: lastSegment?.arrival?.at,
                          bookingDetails: {
                            seats: selectedSeats,
                            meals: selectedMeals,
                            baggage: selectedBaggage,
                            passengers: passengerInfo,
                          },
                        },
                        quantity: passengerCount,
                        price: totalPrice,
                        currency: selectedFlight.price.currency || 'USD',
                      });
                      openDrawer();
                    } catch (error) {
                      console.error('Failed to add to cart:', error);
                      alert('Failed to add flight to cart. Please try again.');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t('payment.addToCart')}
                </button>

                {/* Pay Now Button */}
                <button
                  onClick={async () => {
                    if (!selectedFlight) return;
                    try {
                      const totalPrice = parseFloat(selectedFlight.price.total || '0') +
                        selectedSeats.reduce((sum, seat) => sum + seat.price, 0) +
                        selectedMeals.reduce((sum, meal) => sum + meal.price, 0) +
                        selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0);

                      const firstSegment = selectedFlight.itineraries?.[0]?.segments?.[0];
                      const lastSegment = selectedFlight.itineraries?.[0]?.segments?.[selectedFlight.itineraries[0].segments.length - 1];

                      // First add to cart
                      await addToCart({
                        userId: userId,
                        type: 'FLIGHT',
                        itemId: selectedFlight.id,
                        itemData: {
                          ...selectedFlight,
                          origin: firstSegment?.departure?.iataCode,
                          destination: lastSegment?.arrival?.iataCode,
                          departureDate: firstSegment?.departure?.at,
                          arrivalDate: lastSegment?.arrival?.at,
                          bookingDetails: {
                            seats: selectedSeats,
                            meals: selectedMeals,
                            baggage: selectedBaggage,
                            passengers: passengerInfo,
                          },
                        },
                        quantity: passengerCount,
                        price: totalPrice,
                        currency: selectedFlight.price.currency || 'USD',
                      });

                      // Then proceed to checkout
                      const checkoutResponse = await checkout(userId);
                      navigate('/checkout', {
                        state: {
                          checkoutData: checkoutResponse,
                        },
                      });
                    } catch (error) {
                      console.error('Failed to process payment:', error);
                      alert('Failed to process payment. Please try again.');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {t('payment.payNow', {
                    amount: (
                      parseFloat(selectedFlight?.price.total || '0') +
                      selectedSeats.reduce((sum, seat) => sum + seat.price, 0) +
                      selectedMeals.reduce((sum, meal) => sum + meal.price, 0) +
                      selectedBaggage.reduce((sum, baggage) => sum + baggage.price, 0)
                    ).toFixed(2)
                  })}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightBookingFlow;