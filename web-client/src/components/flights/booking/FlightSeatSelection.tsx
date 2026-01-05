/**
 * Flight Seat Selection Component
 * Step 3 of flight booking workflow
 */

import { useState, useEffect } from 'react';
import { useFlightBookingStore } from '@/store/flightBookingStore';
import { Armchair, Check } from 'lucide-react';

export default function FlightSeatSelection() {
  const {
    selectedFlight,
    passengers,
    seats,
    addSeatSelection,
    removeSeatSelection,
    initializePassengers,
    searchParams,
  } = useFlightBookingStore();

  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);

  // Initialize passengers if not already done
  useEffect(() => {
    if (passengers.length === 0 && searchParams) {
      const { adults = 1, children = 0, infants = 0 } = searchParams;
      const totalPassengers = adults + children + infants;
      const types: Array<'adult' | 'child' | 'infant'> = [];

      for (let i = 0; i < adults; i++) types.push('adult');
      for (let i = 0; i < children; i++) types.push('child');
      for (let i = 0; i < infants; i++) types.push('infant');

      initializePassengers(totalPassengers, types);
    }
  }, [passengers.length, searchParams, initializePassengers]);

  // Mock seat map (in real app, this would come from API)
  const generateSeatMap = () => {
    const rows = 30;
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatMap = [];

    for (let row = 1; row <= rows; row++) {
      for (const col of columns) {
        const seatNumber = `${row}${col}`;
        const isOccupied = Math.random() > 0.7; // 30% seats occupied
        const seatType =
          row <= 5 ? 'business' : row <= 10 ? 'premium' : 'economy';
        const basePrice = seatType === 'business' ? 150 : seatType === 'premium' ? 50 : 0;

        seatMap.push({
          seatNumber,
          row,
          column: col,
          isOccupied,
          seatType,
          price: basePrice,
        });
      }
    }

    return seatMap;
  };

  const [seatMap] = useState(generateSeatMap());
  const segments = selectedFlight?.itineraries?.[0]?.segments || [];
  const currentSegment = segments[selectedSegmentIndex];

  const isSeatSelected = (seatNumber: string, passengerId: string) => {
    return seats.some(
      (s) =>
        s.seatNumber === seatNumber &&
        s.passengerId === passengerId &&
        s.segmentId === currentSegment?.id
    );
  };

  const isSeatTaken = (seatNumber: string) => {
    return seats.some(
      (s) =>
        s.seatNumber === seatNumber &&
        s.segmentId === currentSegment?.id
    );
  };

  const handleSeatClick = (seat: any, passenger: any) => {
    if (seat.isOccupied) return;

    const segmentId = currentSegment?.id || `segment-${selectedSegmentIndex}`;

    if (isSeatSelected(seat.seatNumber, passenger.id)) {
      removeSeatSelection(segmentId, passenger.id);
    } else {
      addSeatSelection({
        segmentId,
        passengerId: passenger.id,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        price: seat.price,
        currency: selectedFlight?.price?.currency || 'USD',
      });
    }
  };

  const getPassengerSeat = (passengerId: string) => {
    const seat = seats.find(
      (s) =>
        s.passengerId === passengerId &&
        s.segmentId === (currentSegment?.id || `segment-${selectedSegmentIndex}`)
    );
    return seat?.seatNumber;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Seats</h2>

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

      {/* Passenger List with Seat Assignments */}
      <div className="mb-6 bg-orange-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Passengers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {passengers.map((passenger) => (
            <div
              key={passenger.id}
              className="bg-white rounded-lg p-3 border border-orange-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {passenger.firstName || `Passenger ${passenger.id.split('-')[1]}`}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">{passenger.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">
                    {getPassengerSeat(passenger.id) || 'No Seat'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Seat Map</h3>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-200 border-2 border-purple-400 rounded"></div>
              <span>Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-200 border-2 border-blue-400 rounded"></div>
              <span>Business</span>
            </div>
          </div>
        </div>

        {/* Select Passenger to Assign Seat */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Click a seat to assign it to:
          </label>
          <div className="flex flex-wrap gap-2">
            {passengers.map((passenger, index) => (
              <button
                key={passenger.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2 ${
                  index === 0
                    ? 'bg-orange-100 border-orange-500 text-orange-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-orange-300'
                }`}
              >
                {passenger.firstName || `Passenger ${index + 1}`}
                {getPassengerSeat(passenger.id) && (
                  <span className="ml-2 font-bold">({getPassengerSeat(passenger.id)})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Airplane Seat Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Column Headers */}
            <div className="flex justify-center mb-2">
              <div className="w-8"></div>
              {['A', 'B', 'C', '', 'D', 'E', 'F'].map((col, i) => (
                <div key={i} className="w-8 text-center font-semibold text-sm text-gray-600">
                  {col}
                </div>
              ))}
            </div>

            {/* Seat Rows */}
            <div className="space-y-1">
              {Array.from({ length: 30 }, (_, rowIndex) => {
                const row = rowIndex + 1;
                return (
                  <div key={row} className="flex justify-center items-center">
                    {/* Row Number */}
                    <div className="w-8 text-center font-semibold text-sm text-gray-600">
                      {row}
                    </div>

                    {/* Seats */}
                    {['A', 'B', 'C', 'aisle', 'D', 'E', 'F'].map((col, colIndex) => {
                      if (col === 'aisle') {
                        return <div key={colIndex} className="w-8"></div>;
                      }

                      const seat = seatMap.find(
                        (s) => s.row === row && s.column === col
                      );

                      if (!seat) return <div key={colIndex} className="w-8"></div>;

                      const isSelected = passengers.some((p) =>
                        isSeatSelected(seat.seatNumber, p.id)
                      );
                      const isTaken = isSeatTaken(seat.seatNumber);

                      return (
                        <button
                          key={colIndex}
                          onClick={() => handleSeatClick(seat, passengers[0])}
                          disabled={seat.isOccupied || isTaken}
                          className={`w-8 h-8 m-0.5 rounded text-xs font-semibold transition-all ${
                            seat.isOccupied || isTaken
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : isSelected
                              ? 'bg-orange-500 text-white'
                              : seat.seatType === 'business'
                              ? 'bg-blue-200 border-2 border-blue-400 hover:bg-blue-300'
                              : seat.seatType === 'premium'
                              ? 'bg-purple-200 border-2 border-purple-400 hover:bg-purple-300'
                              : 'bg-white border-2 border-gray-300 hover:bg-orange-100 hover:border-orange-300'
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4 mx-auto" /> : ''}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Seat selection is optional. You can skip this step and seats will be assigned automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
