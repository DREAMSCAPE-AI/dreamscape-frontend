import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, AlertCircle, ArrowLeftRight, Calendar, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DateRangePicker from '../shared/DateRangePicker';
import Dropdown from '../shared/Dropdown';
import AirportSearch from '../shared/AirportSearch';
import type { UIFlightSearchParams } from '../../services/api/types';
import { useHistoryTracking } from '@/hooks/useHistoryTracking';

interface ValidationErrors {
  origin?: string;
  destination?: string;
  dates?: string;
  passengers?: string;
}

interface FlightSearchProps {
  onSearch: (params: UIFlightSearchParams) => void;
  initialValues?: UIFlightSearchParams | null;
  loading?: boolean;
  error?: string | null;
}

type TripType = 'round-trip' | 'one-way' | 'multi-city';

const FlightSearch: React.FC<FlightSearchProps> = ({
  onSearch,
  initialValues,
  loading = false,
  error = null
}) => {
  const { t } = useTranslation('flights');
  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [searchParams, setSearchParams] = useState<UIFlightSearchParams>({
    origin: initialValues?.origin || '',
    destination: initialValues?.destination || '',
    departureDate: initialValues?.departureDate || '',
    returnDate: initialValues?.returnDate || '',
    adults: initialValues?.adults || 1,
    children: initialValues?.children || 0,
    infants: initialValues?.infants || 0,
    cabinClass: initialValues?.cabinClass || 'economy',
    nonStop: initialValues?.nonStop || false
  });
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [nearbyAirports, setNearbyAirports] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  
  const passengerDropdownRef = useRef<HTMLDivElement>(null);

  // Close passenger dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateSearch = (): boolean => {
    const errors: ValidationErrors = {};

    // Origin validation
    if (!searchParams.origin.trim()) {
      errors.origin = t('search.validation.enterDeparture');
    } else if (searchParams.origin.length < 3) {
      errors.origin = t('search.validation.validCityName');
    }

    // Destination validation
    if (!searchParams.destination.trim()) {
      errors.destination = t('search.validation.enterArrival');
    } else if (searchParams.destination.length < 3) {
      errors.destination = t('search.validation.validCityName');
    }

    // Same city validation
    if (searchParams.origin.trim().toLowerCase() === searchParams.destination.trim().toLowerCase()) {
      errors.destination = t('search.validation.sameCities');
    }

    // Date validation
    if (!searchParams.departureDate) {
      errors.dates = t('search.validation.selectDeparture');
    } else {
      const departureDate = new Date(searchParams.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        errors.dates = t('search.validation.pastDate');
      }

      if (tripType === 'round-trip' && !searchParams.returnDate) {
        errors.dates = t('search.validation.selectReturn');
      }

      if (searchParams.returnDate) {
        const returnDate = new Date(searchParams.returnDate);
        if (returnDate < departureDate) {
          errors.dates = t('search.validation.returnAfterDeparture');
        }
      }
    }

    // Passenger validation
    const totalPassengers = (searchParams.adults || 0) + (searchParams.children || 0) + (searchParams.infants || 0);
    if (totalPassengers === 0) {
      errors.passengers = t('search.validation.atLeastOnePassenger');
    } else if (totalPassengers > 9) {
      errors.passengers = t('search.validation.maxPassengers');
    } else if ((searchParams.infants || 0) > (searchParams.adults || 0)) {
      errors.passengers = t('search.validation.infantsExceedAdults');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // History tracking
  const { trackSearch } = useHistoryTracking();

  const handleSearch = () => {
    setShowErrors(true);
    if (!validateSearch()) {
      return;
    }

    // Prepare search parameters
    const finalParams = {
      ...searchParams,
      returnDate: tripType === 'one-way' ? undefined : searchParams.returnDate,
      flexibleDates,
      nearbyAirports
    };

    // Track the flight search
    trackSearch(`${searchParams.origin} → ${searchParams.destination} (${searchParams.departureDate})`, 'flight');

    onSearch(finalParams);
  };

  const handleDateChange = ({ startDate, endDate }: { startDate: Date | null; endDate: Date | null }) => {
    // Format dates to YYYY-MM-DD format for Amadeus API
    // Use local timezone to avoid date shifting issues
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setSearchParams({
      ...searchParams,
      departureDate: formatDate(startDate),
      returnDate: formatDate(endDate)
    });
    if (showErrors) validateSearch();
  };

  const handleTripTypeChange = (type: TripType) => {
    setTripType(type);
    if (type === 'one-way') {
      setSearchParams({
        ...searchParams,
        returnDate: ''
      });
    }
  };

  const swapAirports = () => {
    setSearchParams({
      ...searchParams,
      origin: searchParams.destination,
      destination: searchParams.origin
    });
  };

  const getTotalPassengers = () => {
    return (searchParams.adults || 0) + (searchParams.children || 0) + (searchParams.infants || 0);
  };

  const getPassengerLabel = () => {
    const total = getTotalPassengers();
    if (total === 0) return t('search.passengers.selectLabel');
    if (total === 1) return t('search.passengers.onePassenger');
    return t('search.passengers.multiplePassengers', { count: total });
  };

  const renderError = (field: keyof ValidationErrors) => {
    if (showErrors && validationErrors[field]) {
      return (
        <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          <span>{validationErrors[field]}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">{t('search.title')}</h2>

      <div className="space-y-6">
        {/* Trip Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('search.tripType.label')}
          </label>
          <div className="flex gap-2">
            {[
              { value: 'round-trip', label: t('search.tripType.roundTrip') },
              { value: 'one-way', label: t('search.tripType.oneWay') },
              { value: 'multi-city', label: t('search.tripType.multiCity') }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTripTypeChange(option.value as TripType)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  tripType === option.value
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Origin & Destination */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.origin.label')}
              </label>
              <AirportSearch
                value={searchParams.origin}
                onChange={(value) => {
                  setSearchParams({ ...searchParams, origin: value });
                  if (showErrors) validateSearch();
                }}
                error={showErrors && !!validationErrors.origin}
              />
              {renderError('origin')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.destination.label')}
              </label>
              <AirportSearch
                value={searchParams.destination}
                onChange={(value) => {
                  setSearchParams({ ...searchParams, destination: value });
                  if (showErrors) validateSearch();
                }}
                error={showErrors && !!validationErrors.destination}
              />
              {renderError('destination')}
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={swapAirports}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 hover:border-orange-300"
            title={t('search.swapButton')}
          >
            <ArrowLeftRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tripType === 'one-way' ? t('search.dates.departureLabel') : t('search.dates.travelDatesLabel')}
          </label>
          <DateRangePicker
            onChange={handleDateChange}
            value={{
              startDate: searchParams.departureDate ? new Date(searchParams.departureDate) : null,
              endDate: tripType === 'one-way' ? null : (searchParams.returnDate ? new Date(searchParams.returnDate) : null)
            }}
            minDate={new Date()}
            singleDate={tripType === 'one-way'}
          />
          {renderError('dates')}
          
          {/* Flexible Dates Option */}
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={flexibleDates}
                onChange={(e) => setFlexibleDates(e.target.checked)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <Calendar className="w-4 h-4" />
              <span>{t('search.dates.flexibleDates')}</span>
            </label>
          </div>
        </div>

        {/* Passengers & Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('search.passengers.label')}
            </label>
            <div className="relative" ref={passengerDropdownRef}>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{getPassengerLabel()}</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPassengerDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Passenger Selection Dropdown */}
              {showPassengerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4">
                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('search.passengers.adults')}</div>
                        <div className="text-sm text-gray-500">{t('search.passengers.adultsAge')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSearchParams({
                            ...searchParams,
                            adults: Math.max(1, (searchParams.adults || 1) - 1)
                          })}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={(searchParams.adults || 1) <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{searchParams.adults || 1}</span>
                        <button
                          type="button"
                          onClick={() => setSearchParams({
                            ...searchParams,
                            adults: Math.min(9, (searchParams.adults || 1) + 1)
                          })}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={getTotalPassengers() >= 9}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('search.passengers.children')}</div>
                        <div className="text-sm text-gray-500">{t('search.passengers.childrenAge')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSearchParams({
                            ...searchParams,
                            children: Math.max(0, (searchParams.children || 0) - 1)
                          })}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={(searchParams.children || 0) <= 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{searchParams.children || 0}</span>
                        <button
                          type="button"
                          onClick={() => setSearchParams({
                            ...searchParams,
                            children: Math.min(8, (searchParams.children || 0) + 1)
                          })}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={getTotalPassengers() >= 9}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('search.passengers.infants')}</div>
                        <div className="text-sm text-gray-500">{t('search.passengers.infantsAge')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSearchParams({
                            ...searchParams,
                            infants: Math.max(0, (searchParams.infants || 0) - 1)
                          })}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={(searchParams.infants || 0) <= 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{searchParams.infants || 0}</span>
                        <button
                          type="button"
                          onClick={() => setSearchParams({
                            ...searchParams,
                            infants: Math.min((searchParams.adults || 1), (searchParams.infants || 0) + 1)
                          })}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={(searchParams.infants || 0) >= (searchParams.adults || 1) || getTotalPassengers() >= 9}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Done Button */}
                    <div className="pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setShowPassengerDropdown(false)}
                        className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        {t('search.passengers.doneButton')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {renderError('passengers')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('search.cabinClass.label')}
            </label>
            <Dropdown
              options={[
                { value: 'economy', label: t('search.cabinClass.economy') },
                { value: 'premium', label: t('search.cabinClass.premium') },
                { value: 'business', label: t('search.cabinClass.business') },
                { value: 'first', label: t('search.cabinClass.first') }
              ]}
              value={searchParams.cabinClass || 'economy'}
              onChange={(value) => setSearchParams({ 
                ...searchParams, 
                cabinClass: value as 'economy' | 'premium' | 'business' | 'first'
              })}
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={searchParams.nonStop || false}
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  nonStop: e.target.checked
                })}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <Filter className="w-4 h-4" />
              <span>{t('search.advancedOptions.nonStop')}</span>
            </label>

            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={nearbyAirports}
                onChange={(e) => setNearbyAirports(e.target.checked)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span>{t('search.advancedOptions.nearbyAirports')}</span>
            </label>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>{t('search.searchButton')}</span>
            </>
          )}
        </button>
        {error && (
          <div className="mt-4 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;