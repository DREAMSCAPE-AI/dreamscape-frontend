import React from 'react';
import { ArrowUpDown, DollarSign, Plane, Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SortOption, FilterState } from '@/types/flights';

interface FlightResultsToolbarProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const FlightResultsToolbar: React.FC<FlightResultsToolbarProps> = ({
  sortOption,
  onSortChange,
  filters,
  onFilterChange,
  onResetFilters,
  totalResults
}) => {
  const { t } = useTranslation('flights');

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'departure-asc', label: t('toolbar.sort.departureEarly') },
    { value: 'departure-desc', label: t('toolbar.sort.departureLate') },
    { value: 'price-asc', label: t('toolbar.sort.priceAsc') },
    { value: 'price-desc', label: t('toolbar.sort.priceDesc') },
    { value: 'duration-asc', label: t('toolbar.sort.durationShort') },
    { value: 'duration-desc', label: t('toolbar.sort.durationLong') }
  ];

  const handleStopsChange = (stop: number, checked: boolean) => {
    const newStops = checked
      ? [...filters.stops, stop]
      : filters.stops.filter(s => s !== stop);
    onFilterChange({ ...filters, stops: newStops });
  };

  const handleTimeRangeChange = (range: string, checked: boolean) => {
    const newRanges = checked
      ? [...filters.departureTimeRanges, range]
      : filters.departureTimeRanges.filter(r => r !== range);
    onFilterChange({ ...filters, departureTimeRanges: newRanges });
  };

  const hasActiveFilters =
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.stops.length > 0 ||
    filters.departureTimeRanges.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-gray-600" />
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Price Range Filters */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{t('toolbar.price')}</span>
          <input
            type="number"
            placeholder={t('toolbar.priceMin')}
            value={filters.priceMin ?? ''}
            onChange={(e) => onFilterChange({
              ...filters,
              priceMin: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            placeholder={t('toolbar.priceMax')}
            value={filters.priceMax ?? ''}
            onChange={(e) => onFilterChange({
              ...filters,
              priceMax: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Stops Filter */}
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{t('toolbar.stops')}</span>
          {[
            { label: t('toolbar.stopsOptions.direct'), value: 0 },
            { label: t('toolbar.stopsOptions.oneStop'), value: 1 },
            { label: t('toolbar.stopsOptions.twoPlus'), value: 2 }
          ].map((stop) => (
            <label key={stop.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stops.includes(stop.value)}
                onChange={(e) => handleStopsChange(stop.value, e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{stop.label}</span>
            </label>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Departure Time Filter */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{t('toolbar.departure')}</span>
          {[
            { label: t('toolbar.departureOptions.early'), value: 'early' },
            { label: t('toolbar.departureOptions.morning'), value: 'morning' },
            { label: t('toolbar.departureOptions.afternoon'), value: 'afternoon' },
            { label: t('toolbar.departureOptions.evening'), value: 'evening' }
          ].map((time) => (
            <button
              key={time.value}
              onClick={() => handleTimeRangeChange(time.value, !filters.departureTimeRanges.includes(time.value))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.departureTimeRanges.includes(time.value)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Results Count */}
        <div className="text-sm text-gray-600 font-medium">
          {t('toolbar.resultsCount', { count: totalResults })}
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            {t('toolbar.resetFilters')}
          </button>
        )}
      </div>
    </div>
  );
};

export default FlightResultsToolbar;
