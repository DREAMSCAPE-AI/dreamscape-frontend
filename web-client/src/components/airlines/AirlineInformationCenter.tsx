import React, { useState } from 'react';
import { Plane, Search, MapPin, Info, Loader2, Globe } from 'lucide-react';
import voyageService from '@/services/voyage/VoyageService';

interface AirlineInfo {
  type: string;
  iataCode: string;
  icaoCode: string;
  businessName: string;
  commonName: string;
}

interface AirlineRoute {
  type: string;
  destination: string;
  market: string;
}

const AirlineInformationCenter: React.FC = () => {
  const [airlineInfo, setAirlineInfo] = useState<AirlineInfo | null>(null);
  const [routes, setRoutes] = useState<AirlineRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('AF');
  const [searchType, setSearchType] = useState<'iata' | 'icao'>('iata');

  const popularAirlines = [
    { iata: 'AF', icao: 'AFR', name: 'Air France' },
    { iata: 'BA', icao: 'BAW', name: 'British Airways' },
    { iata: 'LH', icao: 'DLH', name: 'Lufthansa' },
    { iata: 'EK', icao: 'UAE', name: 'Emirates' },
    { iata: 'QR', icao: 'QTR', name: 'Qatar Airways' },
    { iata: 'SQ', icao: 'SIA', name: 'Singapore Airlines' },
    { iata: 'AA', icao: 'AAL', name: 'American Airlines' },
    { iata: 'DL', icao: 'DAL', name: 'Delta Air Lines' },
    { iata: 'UA', icao: 'UAL', name: 'United Airlines' },
    { iata: 'JL', icao: 'JAL', name: 'Japan Airlines' }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Lookup airline information
      const lookupParams = searchType === 'iata' 
        ? { IATACode: searchQuery.toUpperCase() }
        : { ICAOCode: searchQuery.toUpperCase() };

      try {
        const airlineResponse = await voyageService.lookupAirlineCode(lookupParams);
        
        if (airlineResponse.data && airlineResponse.data.length > 0) {
          setAirlineInfo(airlineResponse.data[0]);
        } else {
          // Fallback to popular airlines data
          const airline = popularAirlines.find(a => 
            searchType === 'iata' ? a.iata === searchQuery.toUpperCase() : a.icao === searchQuery.toUpperCase()
          );
          
          if (airline) {
            setAirlineInfo({
              type: 'airline',
              iataCode: airline.iata,
              icaoCode: airline.icao,
              businessName: airline.name,
              commonName: airline.name
            });
          } else {
            setAirlineInfo(null);
          }
        }
      } catch (error) {
        console.error('Error looking up airline:', error);
        // Try to find in popular airlines as fallback
        const airline = popularAirlines.find(a => 
          searchType === 'iata' ? a.iata === searchQuery.toUpperCase() : a.icao === searchQuery.toUpperCase()
        );
        
        if (airline) {
          setAirlineInfo({
            type: 'airline',
            iataCode: airline.iata,
            icaoCode: airline.icao,
            businessName: airline.name,
            commonName: airline.name
          });
        }
      }

      // Get airline routes
      try {
        const routesResponse = await voyageService.getAirlineRoutes({
          airlineCode: searchQuery.toUpperCase(),
          max: 20
        });
        
        if (routesResponse.data) {
          setRoutes(routesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
        // Mock routes data based on airline
        const mockRoutes = generateMockRoutes(searchQuery.toUpperCase());
        setRoutes(mockRoutes);
      }
    } catch (error) {
      console.error('Error searching airline:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRoutes = (airlineCode: string): AirlineRoute[] => {
    const routesByAirline: { [key: string]: AirlineRoute[] } = {
      'AF': [
        { type: 'flight-destination', destination: 'CDG', market: 'FR' },
        { type: 'flight-destination', destination: 'JFK', market: 'US' },
        { type: 'flight-destination', destination: 'NRT', market: 'JP' },
        { type: 'flight-destination', destination: 'DXB', market: 'AE' },
        { type: 'flight-destination', destination: 'LHR', market: 'GB' }
      ],
      'BA': [
        { type: 'flight-destination', destination: 'LHR', market: 'GB' },
        { type: 'flight-destination', destination: 'JFK', market: 'US' },
        { type: 'flight-destination', destination: 'CDG', market: 'FR' },
        { type: 'flight-destination', destination: 'DXB', market: 'AE' },
        { type: 'flight-destination', destination: 'SIN', market: 'SG' }
      ],
      'LH': [
        { type: 'flight-destination', destination: 'FRA', market: 'DE' },
        { type: 'flight-destination', destination: 'MUC', market: 'DE' },
        { type: 'flight-destination', destination: 'JFK', market: 'US' },
        { type: 'flight-destination', destination: 'NRT', market: 'JP' },
        { type: 'flight-destination', destination: 'PEK', market: 'CN' }
      ]
    };

    return routesByAirline[airlineCode] || [
      { type: 'flight-destination', destination: 'JFK', market: 'US' },
      { type: 'flight-destination', destination: 'LHR', market: 'GB' },
      { type: 'flight-destination', destination: 'CDG', market: 'FR' },
      { type: 'flight-destination', destination: 'DXB', market: 'AE' },
      { type: 'flight-destination', destination: 'NRT', market: 'JP' }
    ];
  };

  const handleQuickSelect = (airline: typeof popularAirlines[0]) => {
    setSearchQuery(airline.iata);
    setSearchType('iata');
    // Auto-search when clicking popular airline
    setTimeout(() => {
      const event = { target: { value: airline.iata } } as any;
      setSearchQuery(airline.iata);
      handleSearch();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Plane className="text-cyan-600" />
            Airline Information Center
          </h1>
          <p className="text-gray-600 text-lg">
            Search airline details, routes, and comprehensive information
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Airline</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'iata' | 'icao')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="iata">IATA Code</option>
                <option value="icao">ICAO Code</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'iata' ? 'IATA Code' : 'ICAO Code'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'iata' ? 'e.g., AF, BA, LH' : 'e.g., AFR, BAW, DLH'}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                maxLength={searchType === 'iata' ? 2 : 3}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        {/* Popular Airlines */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="text-blue-600" />
            Popular Airlines
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {popularAirlines.map((airline) => (
              <button
                key={airline.iata}
                onClick={() => handleQuickSelect(airline)}
                className="p-3 text-left bg-gray-50 hover:bg-cyan-50 rounded-lg transition-colors border border-gray-200 hover:border-cyan-300"
              >
                <div className="font-bold text-gray-900">{airline.iata}</div>
                <div className="text-sm text-gray-600 truncate">{airline.name}</div>
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            <span className="ml-2 text-gray-600">Searching airline information...</span>
          </div>
        )}

        {/* Airline Information */}
        {airlineInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Airline Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="text-green-600" />
                Airline Details
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Business Name</div>
                  <div className="text-xl font-bold text-gray-900">
                    {airlineInfo.businessName || airlineInfo.commonName}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">IATA Code</div>
                    <div className="text-2xl font-bold text-cyan-600">
                      {airlineInfo.iataCode}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">ICAO Code</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {airlineInfo.icaoCode}
                    </div>
                  </div>
                </div>
                {airlineInfo.commonName && airlineInfo.commonName !== airlineInfo.businessName && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Common Name</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {airlineInfo.commonName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Airline Routes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-orange-600" />
                Popular Routes
              </h2>
              <div className="space-y-3">
                {routes.slice(0, 10).map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Plane className="w-4 h-4 text-gray-600 transform rotate-45" />
                      <div className="font-semibold text-gray-900">
                        {route.destination}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {route.market}
                    </div>
                  </div>
                ))}
                {routes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No route information available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !airlineInfo && searchQuery && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">No airline found</h3>
              <p>Try searching with a different {searchType.toUpperCase()} code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirlineInformationCenter;
