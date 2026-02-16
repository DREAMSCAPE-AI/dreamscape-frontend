import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { FlightOffer } from '@/services/voyage/types';
import voyageService from '@/services/voyage/VoyageService';

interface SeatSelectionProps {
  flight: FlightOffer;
  returnFlight?: FlightOffer | null;
  passengers: number;
  onBack: () => void;
  onContinue: (selectedSeats: SelectedSeat[], returnSelectedSeats?: SelectedSeat[]) => void;
}

export interface SelectedSeat {
  passengerId: number;
  seatNumber: string;
  seatType: 'economy' | 'premium-economy' | 'business' | 'first';
  price: number;
  segment: number; // For connecting flights
}

interface AmadeusSeat {
  number: string;
  characteristicsCodes?: string[];
  travelerPricing?: {
    price?: {
      currency: string;
      total: string;
    };
  };
  available: boolean;
}

interface AmadeusSeatMap {
  type: string;
  flightOfferId: string;
  segmentId: string;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  class: string;
  deck: {
    deckType: string;
    deckConfiguration: {
      width: number;
      length: number;
      startSeatRow: number;
      endSeatRow: number;
      startWingsRow?: number;
      endWingsRow?: number;
      exitRowsX?: number[];
    };
    facilities?: any[];
    seats: AmadeusSeat[];
  };
}

interface Seat {
  number: string;
  type: 'economy' | 'premium-economy' | 'business' | 'first';
  status: 'available' | 'occupied' | 'selected' | 'blocked';
  price: number;
  features?: string[];
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  flight,
  returnFlight,
  passengers,
  onBack,
  onContinue
}) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [returnSelectedSeats, setReturnSelectedSeats] = useState<SelectedSeat[]>([]);
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [seatMaps, setSeatMaps] = useState<AmadeusSeatMap[]>([]);
  const [returnSeatMaps, setReturnSeatMaps] = useState<AmadeusSeatMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelectingReturnSeats, setIsSelectingReturnSeats] = useState(false);

  // Fetch real seat map from Amadeus API
  useEffect(() => {
    const fetchSeatMaps = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch outbound flight seat map
        const response = await voyageService.getSeatMap({
          flightOfferId: flight.id
        });

        if (response.data && Array.isArray(response.data)) {
          setSeatMaps(response.data);
        } else {
          throw new Error('Invalid seat map data received');
        }

        // Fetch return flight seat map if exists
        if (returnFlight) {
          const returnResponse = await voyageService.getSeatMap({
            flightOfferId: returnFlight.id
          });

          if (returnResponse.data && Array.isArray(returnResponse.data)) {
            setReturnSeatMaps(returnResponse.data);
          } else {
            throw new Error('Invalid return seat map data received');
          }
        }
      } catch (error) {
        console.error('Failed to fetch seat map:', error);
        setError('Failed to load seat map. Using fallback seat layout.');
        // Generate fallback seat maps
        console.log('[SeatSelection] Generating fallback seat map for flight:', flight);
        const fallbackMaps = generateFallbackSeatMap(flight);
        console.log('[SeatSelection] Generated fallback seat maps:', fallbackMaps);
        setSeatMaps(fallbackMaps);
        if (returnFlight) {
          setReturnSeatMaps(generateFallbackSeatMap(returnFlight));
        }
      } finally {
        console.log('[SeatSelection] Setting loading to false');
        setLoading(false);
      }
    };

    fetchSeatMaps();
  }, [flight.id, returnFlight?.id]);

  // Generate fallback seat map when API fails
  const generateFallbackSeatMap = (targetFlight: FlightOffer): AmadeusSeatMap[] => {
    console.log('[generateFallbackSeatMap] Target flight:', targetFlight);
    console.log('[generateFallbackSeatMap] Itineraries:', targetFlight.itineraries);
    console.log('[generateFallbackSeatMap] Segments:', targetFlight.itineraries?.[0]?.segments);
    return targetFlight.itineraries[0].segments.map((segment, index) => {
      const aircraftType = segment.aircraft?.code || 'A320';
      console.log('[generateFallbackSeatMap] Segment', index, '- Aircraft:', aircraftType);
      const seats: AmadeusSeat[] = [];
      
      // Different configurations based on aircraft type
      const configs = {
        'A380': { rows: 60, businessRows: 14, firstRows: 4 },
        'B777': { rows: 42, businessRows: 8, firstRows: 0 },
        'A320': { rows: 30, businessRows: 0, firstRows: 0 },
        'B737': { rows: 32, businessRows: 0, firstRows: 0 }
      };
      
      const config = configs[aircraftType as keyof typeof configs] || configs['A320'];
      
      // Generate seats
      for (let row = 1; row <= config.rows; row++) {
        const letters = row <= config.firstRows ? ['A', 'F'] : 
                       row <= config.firstRows + config.businessRows ? ['A', 'C', 'D', 'F'] :
                       ['A', 'B', 'C', 'D', 'E', 'F'];
        
        letters.forEach(letter => {
          const seatNumber = `${row}${letter}`;
          let price = 0;
          let characteristicsCodes: string[] = [];
          
          if (row <= config.firstRows) {
            price = 500;
            characteristicsCodes = ['1', 'CH', 'RS', 'LS'];
          } else if (row <= config.firstRows + config.businessRows) {
            price = 200;
            characteristicsCodes = ['CH', 'RS', 'LS'];
          } else if (row <= config.firstRows + config.businessRows + 5) {
            price = 50;
            characteristicsCodes = ['CH'];
          }
          
          // Add special features for certain seats
          if (letter === 'A' || letter === 'F') {
            characteristicsCodes.push('W');
          }
          if (letter === 'C' || letter === 'D') {
            characteristicsCodes.push('A');
          }
          if (row === 12 || row === 13 || row === 24 || row === 25) {
            characteristicsCodes.push('E');
            price += 25;
          }
          
          seats.push({
            number: seatNumber,
            characteristicsCodes,
            travelerPricing: price > 0 ? {
              price: {
                currency: 'USD',
                total: price.toString()
              }
            } : undefined,
            available: Math.random() > 0.3 // 70% availability
          });
        });
      }

      return {
        type: 'seat-map',
        flightOfferId: targetFlight.id,
        segmentId: `${index}`,
        carrierCode: segment.carrierCode,
        number: segment.number,
        aircraft: {
          code: aircraftType
        },
        class: 'M', // Mixed class
        deck: {
          deckType: 'MAIN',
          deckConfiguration: {
            width: 6,
            length: config.rows,
            startSeatRow: 1,
            endSeatRow: config.rows,
            startWingsRow: Math.floor(config.rows * 0.3),
            endWingsRow: Math.floor(config.rows * 0.7),
            exitRowsX: [12, 13, 24, 25]
          },
          seats
        }
      };
    });
  };

  // Convert Amadeus seat to our Seat interface
  const convertAmadeusSeat = (amadeusSeat: AmadeusSeat): Seat => {
    const characteristics = amadeusSeat.characteristicsCodes || [];
    let seatType: Seat['type'] = 'economy';
    let features: string[] = [];
    
    // Determine seat type based on characteristics
    if (characteristics.includes('1') || characteristics.includes('F')) {
      seatType = 'first';
    } else if (characteristics.includes('C') || characteristics.includes('J')) {
      seatType = 'business';
    } else if (characteristics.includes('W+') || characteristics.includes('Y+')) {
      seatType = 'premium-economy';
    }
    
    // Add features based on characteristics
    if (characteristics.includes('W')) features.push('Window seat');
    if (characteristics.includes('A')) features.push('Aisle seat');
    if (characteristics.includes('E')) features.push('Emergency exit');
    if (characteristics.includes('CH')) features.push('Extra legroom');
    if (characteristics.includes('RS')) features.push('Recline seat');
    if (characteristics.includes('LS')) features.push('Lie-flat seat');
    if (characteristics.includes('UP')) features.push('Upper deck');
    if (characteristics.includes('9')) features.push('Quiet zone');
    
    const price = amadeusSeat.travelerPricing?.price ? 
      parseFloat(amadeusSeat.travelerPricing.price.total) : 0;
    
    return {
      number: amadeusSeat.number,
      type: seatType,
      status: amadeusSeat.available ? 'available' : 'occupied',
      price,
      features
    };
  };

  // Get seats for current segment
  const getCurrentSeats = (): Seat[] => {
    const activeSeatMaps = isSelectingReturnSeats ? returnSeatMaps : seatMaps;
    if (!activeSeatMaps[currentSegment]) return [];

    return activeSeatMaps[currentSegment].deck.seats.map(convertAmadeusSeat);
  };

  // Get active flight based on selection state
  const getActiveFlight = (): FlightOffer => {
    return isSelectingReturnSeats && returnFlight ? returnFlight : flight;
  };

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status !== 'available') return;

    const newSelection: SelectedSeat = {
      passengerId: currentPassenger,
      seatNumber: seat.number,
      seatType: seat.type,
      price: seat.price,
      segment: currentSegment
    };

    if (isSelectingReturnSeats) {
      // Handle return flight seat selection
      const updatedSeats = returnSelectedSeats.filter(
        s => !(s.passengerId === currentPassenger && s.segment === currentSegment)
      );
      setReturnSelectedSeats([...updatedSeats, newSelection]);
    } else {
      // Handle outbound flight seat selection
      const updatedSeats = selectedSeats.filter(
        s => !(s.passengerId === currentPassenger && s.segment === currentSegment)
      );
      setSelectedSeats([...updatedSeats, newSelection]);
    }

    // Move to next passenger if not the last one
    if (currentPassenger < passengers - 1) {
      setCurrentPassenger(currentPassenger + 1);
    }
  };

  const getSeatStatus = (seat: Seat): 'available' | 'occupied' | 'selected' | 'blocked' => {
    if (seat.status === 'occupied') return 'occupied';

    const activeSeats = isSelectingReturnSeats ? returnSelectedSeats : selectedSeats;
    const isSelected = activeSeats.some(
      s => s.seatNumber === seat.number && s.segment === currentSegment
    );

    return isSelected ? 'selected' : 'available';
  };

  const getSeatColor = (status: string, type: string) => {
    if (status === 'selected') return 'bg-blue-500 text-white';
    if (status === 'occupied') return 'bg-gray-400 text-gray-600 cursor-not-allowed';
    
    switch (type) {
      case 'first': return 'bg-purple-100 hover:bg-purple-200 text-purple-800';
      case 'business': return 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800';
      case 'premium-economy': return 'bg-green-100 hover:bg-green-200 text-green-800';
      default: return 'bg-gray-100 hover:bg-gray-200 text-gray-800';
    }
  };

  const getTotalPrice = () => {
    const outboundTotal = selectedSeats.reduce((total, seat) => total + seat.price, 0);
    const returnTotal = returnSelectedSeats.reduce((total, seat) => total + seat.price, 0);
    return outboundTotal + returnTotal;
  };

  const canContinue = () => {
    const activeFlight = getActiveFlight();
    const activeSeats = isSelectingReturnSeats ? returnSelectedSeats : selectedSeats;

    // Check if all passengers have seats selected for all segments of current flight
    const requiredSelections = passengers * activeFlight.itineraries[0].segments.length;
    return activeSeats.length === requiredSelections;
  };

  const handleContinue = () => {
    if (returnFlight && !isSelectingReturnSeats) {
      // Switch to return flight seat selection
      setIsSelectingReturnSeats(true);
      setCurrentSegment(0);
      setCurrentPassenger(0);
    } else {
      // Proceed to next step
      onContinue(selectedSeats, returnFlight ? returnSelectedSeats : undefined);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading seat map...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeFlight = getActiveFlight();
  const activeSeatMaps = isSelectingReturnSeats ? returnSeatMaps : seatMaps;
  const currentSeatMap = activeSeatMaps[currentSegment];
  const seats = getCurrentSeats();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Round-trip flight indicator */}
        {returnFlight && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className={`px-4 py-2 rounded-lg font-medium ${!isSelectingReturnSeats ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                    Vol aller
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-medium ${isSelectingReturnSeats ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                    Vol retour
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {isSelectingReturnSeats ? 'Sélectionnez vos sièges pour le vol retour' : 'Sélectionnez vos sièges pour le vol aller'}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSelectingReturnSeats ? 'Select Your Return Flight Seats' : 'Select Your Seats'}
          </h2>
          <p className="text-gray-600">
            Choose seats for {passengers} passenger{passengers > 1 ? 's' : ''} on your {isSelectingReturnSeats ? 'return ' : ''}flight
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Flight Segment Navigation */}
        {activeFlight.itineraries[0].segments.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => setCurrentSegment(Math.max(0, currentSegment - 1))}
                disabled={currentSegment === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Segment
              </button>

              <div className="text-center">
                <h3 className="font-semibold text-gray-900">
                  Segment {currentSegment + 1} of {activeFlight.itineraries[0].segments.length}
                </h3>
                {currentSeatMap && (
                  <p className="text-sm text-gray-600">
                    {activeFlight.itineraries[0].segments[currentSegment].departure.iataCode} → {activeFlight.itineraries[0].segments[currentSegment].arrival.iataCode}
                    {' • '}{currentSeatMap.carrierCode} {currentSeatMap.number}
                    {' • '}{currentSeatMap.aircraft.code}
                  </p>
                )}
              </div>

              <button
                onClick={() => setCurrentSegment(Math.min(activeFlight.itineraries[0].segments.length - 1, currentSegment + 1))}
                disabled={currentSegment === activeFlight.itineraries[0].segments.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next Segment
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Passenger Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Selecting seat for:</span>
            <div className="flex gap-2">
              {Array.from({ length: passengers }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPassenger(i)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    currentPassenger === i
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Passenger {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            {/* Aircraft Layout */}
            <div className="max-w-md mx-auto">
              {/* Aircraft Front */}
              <div className="text-center mb-4">
                <div className="inline-block bg-gray-300 rounded-t-full px-8 py-2 text-sm font-medium text-gray-700">
                  Front of Aircraft
                </div>
              </div>

              {/* Seat Grid */}
              <div className="space-y-2">
                {currentSeatMap && (() => {
                  const rows: { [key: number]: Seat[] } = {};
                  seats.forEach(seat => {
                    const row = parseInt(seat.number.match(/\d+/)?.[0] || '0');
                    if (!rows[row]) rows[row] = [];
                    rows[row].push(seat);
                  });

                  return Object.keys(rows)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map(rowNumber => (
                      <div key={rowNumber} className="flex items-center justify-center gap-1">
                        <div className="w-8 text-xs text-gray-500 text-center">{rowNumber}</div>
                        <div className="flex gap-1">
                          {rows[rowNumber]
                            .sort((a, b) => a.number.localeCompare(b.number))
                            .map((seat, seatIndex) => {
                              const status = getSeatStatus(seat);
                              const isAisle = seatIndex === 2; // Add space after C seat for aisle
                              
                              return (
                                <React.Fragment key={seat.number}>
                                  <button
                                    onClick={() => handleSeatSelect(seat)}
                                    disabled={status === 'occupied'}
                                    className={`w-8 h-8 text-xs font-medium rounded transition-colors ${getSeatColor(status, seat.type)}`}
                                    title={`${seat.number} - ${seat.type} - $${seat.price}${seat.features ? ' - ' + seat.features.join(', ') : ''}`}
                                  >
                                    {seat.number.slice(-1)}
                                  </button>
                                  {isAisle && <div className="w-4" />}
                                </React.Fragment>
                              );
                            })}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Economy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Premium Economy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-indigo-100 rounded"></div>
                <span>Business</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-purple-100 rounded"></div>
                <span>First</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Occupied</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Seats Summary */}
        {(selectedSeats.length > 0 || returnSelectedSeats.length > 0) && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Selected Seats</h3>
            <div className="space-y-1">
              {selectedSeats.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-blue-700 uppercase mt-2">Outbound Flight</div>
                  {selectedSeats.map((seat, index) => (
                    <div key={`outbound-${index}`} className="flex justify-between text-sm">
                      <span>
                        Passenger {seat.passengerId + 1} - Segment {seat.segment + 1}: {seat.seatNumber}
                      </span>
                      <span className="font-medium">
                        {seat.price > 0 ? `$${seat.price}` : 'Free'}
                      </span>
                    </div>
                  ))}
                </>
              )}
              {returnSelectedSeats.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-blue-700 uppercase mt-2">Return Flight</div>
                  {returnSelectedSeats.map((seat, index) => (
                    <div key={`return-${index}`} className="flex justify-between text-sm">
                      <span>
                        Passenger {seat.passengerId + 1} - Segment {seat.segment + 1}: {seat.seatNumber}
                      </span>
                      <span className="font-medium">
                        {seat.price > 0 ? `$${seat.price}` : 'Free'}
                      </span>
                    </div>
                  ))}
                </>
              )}
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Total Seat Fees:</span>
                  <span>${getTotalPrice()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back to Flight Details
          </button>

          <button
            onClick={handleContinue}
            disabled={!canContinue()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {returnFlight && !isSelectingReturnSeats ? 'Continue to Return Flight Seats' : 'Continue to Meals'}
            {!canContinue() && (
              <span className="ml-2 text-xs">
                ({(isSelectingReturnSeats ? returnSelectedSeats : selectedSeats).length}/{passengers * activeFlight.itineraries[0].segments.length} selected)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
