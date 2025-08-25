import React, { useState } from 'react';
import { Sliders, Clock, Plane, DollarSign, Shield, Star } from 'lucide-react';

interface FlightFilters {
  price: {
    min: number;
    max: number;
  };
  airlines: string[];
  departureTimes: string[];
  stops: string[];
  cabinClass: string[];
}

interface FlightFiltersProps {
  onFilterChange: (filters: FlightFilters) => void;
  initialFilters?: Partial<FlightFilters>;
}

const FlightFilters: React.FC<FlightFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState<FlightFilters>({
    price: { min: 0, max: 2000, ...initialFilters.price },
    airlines: initialFilters.airlines || [],
    departureTimes: initialFilters.departureTimes || [],
    stops: initialFilters.stops || [],
    cabinClass: initialFilters.cabinClass || []
  });

  const handleFilterChange = (newFilters: Partial<FlightFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="2000"
                value={filters.price.max}
                onChange={(e) => handleFilterChange({
                  price: { ...filters.price, max: parseInt(e.target.value) }
                })}
                className="w-full accent-orange-500"
              />
            </div>
            <div className="w-20 px-3 py-1 bg-gray-50 rounded text-center text-sm">
              ${filters.price.max}
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>$0</span>
            <span>$2000+</span>
          </div>
        </div>
      </div>

      {/* Airlines */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Airlines
        </label>
        <div className="space-y-3">
          {[
            'Air France',
            'British Airways',
            'Lufthansa',
            'Emirates',
            'Qatar Airways'
          ].map((airline) => (
            <label key={airline} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline)}
                onChange={(e) => {
                  const newAirlines = e.target.checked
                    ? [...filters.airlines, airline]
                    : filters.airlines.filter(a => a !== airline);
                  handleFilterChange({ airlines: newAirlines });
                }}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-700 group-hover:text-orange-500 transition-colors">
                {airline}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Times */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Departure Time
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Early Morning', value: 'early', time: '12am - 6am' },
            { label: 'Morning', value: 'morning', time: '6am - 12pm' },
            { label: 'Afternoon', value: 'afternoon', time: '12pm - 6pm' },
            { label: 'Evening', value: 'evening', time: '6pm - 12am' }
          ].map((time) => (
            <button
              key={time.value}
              onClick={() => {
                const newTimes = filters.departureTimes.includes(time.value)
                  ? filters.departureTimes.filter(t => t !== time.value)
                  : [...filters.departureTimes, time.value];
                handleFilterChange({ departureTimes: newTimes });
              }}
              className={`p-3 rounded-lg text-left transition-colors ${
                filters.departureTimes.includes(time.value)
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="text-sm font-medium">{time.label}</div>
              <div className="text-xs opacity-70">{time.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Stops
        </label>
        <div className="space-y-3">
          {[
            { label: 'Non-stop', value: '0' },
            { label: '1 Stop', value: '1' },
            { label: '2+ Stops', value: '2' }
          ].map((stop) => (
            <label key={stop.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.stops.includes(stop.value)}
                onChange={(e) => {
                  const newStops = e.target.checked
                    ? [...filters.stops, stop.value]
                    : filters.stops.filter(s => s !== stop.value);
                  handleFilterChange({ stops: newStops });
                }}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-700 group-hover:text-orange-500 transition-colors">
                {stop.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Cabin Class */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cabin Class
        </label>
        <div className="space-y-3">
          {[
            { label: 'Economy', value: 'economy' },
            { label: 'Premium Economy', value: 'premium' },
            { label: 'Business', value: 'business' },
            { label: 'First Class', value: 'first' }
          ].map((cabin) => (
            <label key={cabin.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.cabinClass.includes(cabin.value)}
                onChange={(e) => {
                  const newClasses = e.target.checked
                    ? [...filters.cabinClass, cabin.value]
                    : filters.cabinClass.filter(c => c !== cabin.value);
                  handleFilterChange({ cabinClass: newClasses });
                }}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-700 group-hover:text-orange-500 transition-colors">
                {cabin.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightFilters;