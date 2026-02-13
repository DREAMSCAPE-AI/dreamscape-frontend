import React, { useState } from 'react';
import { Sliders, Clock, Plane, DollarSign, Shield, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('flights');
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
        <h2 className="text-lg font-semibold">{t('filters.title')}</h2>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filters.priceRange.label')}
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
            <span>{t('filters.priceRange.min')}</span>
            <span>{t('filters.priceRange.max')}</span>
          </div>
        </div>
      </div>

      {/* Airlines */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          {t('filters.airlines')}
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
          {t('filters.departureTime.label')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('filters.departureTime.earlyMorning'), value: 'early', time: t('filters.departureTime.earlyMorningTime') },
            { label: t('filters.departureTime.morning'), value: 'morning', time: t('filters.departureTime.morningTime') },
            { label: t('filters.departureTime.afternoon'), value: 'afternoon', time: t('filters.departureTime.afternoonTime') },
            { label: t('filters.departureTime.evening'), value: 'evening', time: t('filters.departureTime.eveningTime') }
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
          {t('filters.stops.label')}
        </label>
        <div className="space-y-3">
          {[
            { label: t('filters.stops.nonStop'), value: '0' },
            { label: t('filters.stops.oneStop'), value: '1' },
            { label: t('filters.stops.twoPlus'), value: '2' }
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
          {t('filters.cabinClass.label')}
        </label>
        <div className="space-y-3">
          {[
            { label: t('search.cabinClass.economy'), value: 'economy' },
            { label: t('search.cabinClass.premium'), value: 'premium' },
            { label: t('search.cabinClass.business'), value: 'business' },
            { label: t('search.cabinClass.first'), value: 'first' }
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