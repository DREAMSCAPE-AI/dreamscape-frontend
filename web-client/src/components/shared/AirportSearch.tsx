import React, { useState, useEffect, useRef } from 'react';
import { Plane, Search, MapPin } from 'lucide-react';
import APIService from '@/services/voyage/VoyageService';

interface Airport {
  iataCode: string;
  name: string;
  address: {
    cityName: string;
    countryName: string;
  };
}

interface AirportSearchProps {
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

const AirportSearch: React.FC<AirportSearchProps> = ({
  value,
  onChange,
  placeholder = "Enter city or airport",
  error = false,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const searchAirports = async (query: string) => {
    if (query.length < 2) {
      setAirports([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await APIService.searchAirports({ keyword: query });
      // L'API retourne { data: [...], meta: {...} }
      const airportData = response?.data || [];

      // Filter and format airport data
      const formattedAirports: Airport[] = airportData
        .filter((item: any) => item.subType === 'AIRPORT' && item.iataCode)
        .map((item: any) => ({
          iataCode: item.iataCode,
          name: item.name,
          address: {
            cityName: item.address?.cityName || '',
            countryName: item.address?.countryName || ''
          }
        }))
        .slice(0, 8); // Limit to 8 results

      setAirports(formattedAirports);
      setShowDropdown(formattedAirports.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Airport search error:', error);
      setAirports([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchAirports(newValue);
    }, 300);
  };

  const handleAirportSelect = (airport: Airport) => {
    const displayValue = `${airport.address.cityName} (${airport.iataCode})`;
    setInputValue(displayValue);
    onChange(airport.iataCode, airport);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || airports.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < airports.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < airports.length) {
          handleAirportSelect(airports[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (airports.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 border ${
            error ? 'border-red-500' : 'border-gray-200'
          } ${className}`}
        />
        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        {!isLoading && inputValue && (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </div>

      {showDropdown && airports.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {airports.map((airport, index) => (
            <div
              key={airport.iataCode}
              onClick={() => handleAirportSelect(airport)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {airport.address.cityName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {airport.name} ({airport.iataCode})
                  </div>
                  <div className="text-xs text-gray-400">
                    {airport.address.countryName}
                  </div>
                </div>
                <div className="text-sm font-mono text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {airport.iataCode}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AirportSearch;
