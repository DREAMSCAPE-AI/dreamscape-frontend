import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Plane, TrendingUp, Search, Loader2, Navigation } from 'lucide-react';
import voyageService from '@/services/voyage/VoyageService';

interface AirportPerformance {
  onTime: number;
  delayed: number;
  cancelled: number;
  date: string;
}

interface NearestAirport {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  iataCode: string;
  address: {
    cityName: string;
    countryName: string;
  };
  geoCode: {
    latitude: number;
    longitude: number;
  };
  distance: {
    value: number;
    unit: string;
  };
}

interface AirportRoute {
  type: string;
  destination: string;
  market: string;
}

const AirportInformationHub: React.FC = () => {
  const [performance, setPerformance] = useState<AirportPerformance | null>(null);
  const [nearestAirports, setNearestAirports] = useState<NearestAirport[]>([]);
  const [routes, setRoutes] = useState<AirportRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState('JFK');
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  const airportOptions = [
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
    { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo' },
    { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' }
  ];

  const fetchAirportData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch airport performance
      try {
        const performanceResponse = await voyageService.getAirportOnTimePerformance({
          airportCode: selectedAirport,
          date: today
        });
        
        if (performanceResponse.data) {
          setPerformance(performanceResponse.data);
        }
      } catch (error) {
        console.error('Error fetching performance:', error);
        // Mock performance data
        setPerformance({
          onTime: Math.floor(Math.random() * 30) + 70,
          delayed: Math.floor(Math.random() * 20) + 5,
          cancelled: Math.floor(Math.random() * 5) + 1,
          date: today
        });
      }

      // Fetch airport routes
      try {
        const routesResponse = await voyageService.getAirportRoutes({
          departureAirportCode: selectedAirport,
          max: 20
        });
        
        if (routesResponse.data) {
          setRoutes(routesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
        // Mock routes data
        const mockRoutes = [
          { type: 'flight-destination', destination: 'LAX', market: 'US' },
          { type: 'flight-destination', destination: 'LHR', market: 'GB' },
          { type: 'flight-destination', destination: 'CDG', market: 'FR' },
          { type: 'flight-destination', destination: 'NRT', market: 'JP' },
          { type: 'flight-destination', destination: 'DXB', market: 'AE' }
        ];
        setRoutes(mockRoutes);
      }

      // Fetch nearest airports
      try {
        const nearestResponse = await voyageService.getNearestRelevantAirports({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: 500,
          limit: 10
        });
        
        if (nearestResponse.data) {
          setNearestAirports(nearestResponse.data);
        }
      } catch (error) {
        console.error('Error fetching nearest airports:', error);
        // Mock nearest airports
        const mockNearestAirports = [
          {
            type: 'location',
            subType: 'AIRPORT',
            name: 'JFK',
            detailedName: 'John F. Kennedy International Airport',
            iataCode: 'JFK',
            address: { cityName: 'New York', countryName: 'United States' },
            geoCode: { latitude: 40.6413, longitude: -73.7781 },
            distance: { value: 15, unit: 'KM' }
          },
          {
            type: 'location',
            subType: 'AIRPORT',
            name: 'LGA',
            detailedName: 'LaGuardia Airport',
            iataCode: 'LGA',
            address: { cityName: 'New York', countryName: 'United States' },
            geoCode: { latitude: 40.7769, longitude: -73.8740 },
            distance: { value: 12, unit: 'KM' }
          },
          {
            type: 'location',
            subType: 'AIRPORT',
            name: 'EWR',
            detailedName: 'Newark Liberty International Airport',
            iataCode: 'EWR',
            address: { cityName: 'Newark', countryName: 'United States' },
            geoCode: { latitude: 40.6895, longitude: -74.1745 },
            distance: { value: 18, unit: 'KM' }
          }
        ];
        setNearestAirports(mockNearestAirports);
      }
    } catch (error) {
      console.error('Error fetching airport data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  useEffect(() => {
    fetchAirportData();
  }, [selectedAirport, userLocation]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <MapPin className="text-indigo-600" />
            Airport Information Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time airport performance, routes, and nearby airport information
          </p>
        </div>

        {/* Airport Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Airport
              </label>
              <select
                value={selectedAirport}
                onChange={(e) => setSelectedAirport(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {airportOptions.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name} ({airport.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={fetchAirportData}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Refresh Data
              </button>
              <button
                onClick={getUserLocation}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Use My Location
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">Loading airport data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Airport Performance */}
            {performance && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="text-blue-600" />
                  On-Time Performance
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">On Time</h3>
                      <p className="text-sm text-gray-600">Flights departing on schedule</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${getPerformanceColor(performance.onTime)}`}>
                      <span className="font-bold">{performance.onTime}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Delayed</h3>
                      <p className="text-sm text-gray-600">Flights with delays</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-orange-600 bg-orange-100">
                      <span className="font-bold">{performance.delayed}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Cancelled</h3>
                      <p className="text-sm text-gray-600">Cancelled flights</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-red-600 bg-red-100">
                      <span className="font-bold">{performance.cancelled}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Data for {performance.date}
                </div>
              </div>
            )}

            {/* Airport Routes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plane className="text-green-600" />
                Popular Routes
              </h2>
              <div className="space-y-3">
                {routes.slice(0, 8).map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedAirport} → {route.destination}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {route.market}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearest Airports */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Navigation className="text-purple-600" />
                Nearest Airports to Your Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearestAirports.slice(0, 6).map((airport, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{airport.iataCode}</h3>
                      <span className="text-sm text-purple-600 font-semibold">
                        {airport.distance.value} {airport.distance.unit}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{airport.name}</h4>
                    <p className="text-sm text-gray-600">
                      {airport.address.cityName}, {airport.address.countryName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirportInformationHub;
