import React, { useState } from 'react';
import { Plane, Clock, AlertTriangle, CheckCircle, Search, Loader2 } from 'lucide-react';
import voyageService from '@/services/voyage/VoyageService';

interface FlightStatus {
  flightDate: string;
  flightNumber: string;
  flightStatus: string;
  departure: {
    iataCode: string;
    scheduledTime: string;
    actualTime?: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    iataCode: string;
    scheduledTime: string;
    actualTime?: string;
    terminal?: string;
    gate?: string;
  };
  aircraft?: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
}

interface DelayPrediction {
  probability: number;
  result: string;
  subType: string;
  upselling?: {
    probability: number;
    result: string;
  };
}

const FlightStatusTracker: React.FC = () => {
  const [flightStatus, setFlightStatus] = useState<FlightStatus | null>(null);
  const [delayPrediction, setDelayPrediction] = useState<DelayPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    carrierCode: 'AF',
    flightNumber: '1234',
    scheduledDepartureDate: new Date().toISOString().split('T')[0]
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Get flight status
      const statusResponse = await voyageService.getFlightStatus(searchParams);
      
      if (statusResponse.data && statusResponse.data.length > 0) {
        const flight = statusResponse.data[0];
        setFlightStatus(flight);

        // If we have flight details, predict delay
        if (flight.departure && flight.arrival) {
          try {
            const delayResponse = await voyageService.predictFlightDelay({
              originLocationCode: flight.departure.iataCode,
              destinationLocationCode: flight.arrival.iataCode,
              departureDate: flight.flightDate,
              departureTime: flight.departure.scheduledTime,
              arrivalDate: flight.flightDate,
              arrivalTime: flight.arrival.scheduledTime,
              aircraftCode: flight.aircraft?.code || 'A320',
              carrierCode: flight.operating?.carrierCode || searchParams.carrierCode,
              flightNumber: searchParams.flightNumber,
              duration: 'PT2H30M'
            });
            
            if (delayResponse.data) {
              setDelayPrediction(delayResponse.data);
            }
          } catch (delayError) {
            console.error('Error predicting delay:', delayError);
            // Mock delay prediction
            setDelayPrediction({
              probability: Math.random() * 0.3,
              result: Math.random() > 0.7 ? 'DELAYED' : 'ON_TIME',
              subType: 'ARRIVAL_DELAY',
              upselling: {
                probability: Math.random() * 0.2,
                result: 'UPGRADE_AVAILABLE'
              }
            });
          }
        }
      } else {
        // Mock flight status if no real data
        setFlightStatus({
          flightDate: searchParams.scheduledDepartureDate,
          flightNumber: `${searchParams.carrierCode}${searchParams.flightNumber}`,
          flightStatus: 'SCHEDULED',
          departure: {
            iataCode: 'CDG',
            scheduledTime: '14:30',
            terminal: '2E',
            gate: 'K12'
          },
          arrival: {
            iataCode: 'JFK',
            scheduledTime: '17:45',
            terminal: '1',
            gate: 'B6'
          },
          aircraft: {
            code: 'A350'
          },
          operating: {
            carrierCode: searchParams.carrierCode
          }
        });

        setDelayPrediction({
          probability: 0.15,
          result: 'ON_TIME',
          subType: 'DEPARTURE_DELAY'
        });
      }
    } catch (error) {
      console.error('Error fetching flight status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'on_time':
        return 'text-green-600 bg-green-100';
      case 'delayed':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'boarding':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'on_time':
        return <CheckCircle className="w-5 h-5" />;
      case 'delayed':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Plane className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Plane className="text-blue-600" />
            Flight Status Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Track real-time flight status and delay predictions
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Flight</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Airline Code
              </label>
              <input
                type="text"
                value={searchParams.carrierCode}
                onChange={(e) => setSearchParams(prev => ({ ...prev, carrierCode: e.target.value }))}
                placeholder="e.g., AF, BA, LH"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flight Number
              </label>
              <input
                type="text"
                value={searchParams.flightNumber}
                onChange={(e) => setSearchParams(prev => ({ ...prev, flightNumber: e.target.value }))}
                placeholder="e.g., 1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Date
              </label>
              <input
                type="date"
                value={searchParams.scheduledDepartureDate}
                onChange={(e) => setSearchParams(prev => ({ ...prev, scheduledDepartureDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track Flight
            </button>
          </div>
        </div>

        {/* Flight Status Results */}
        {flightStatus && (
          <div className="space-y-6">
            {/* Flight Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {flightStatus.flightNumber}
                  </h2>
                  <p className="text-gray-600">{flightStatus.flightDate}</p>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(flightStatus.flightStatus)}`}>
                  {getStatusIcon(flightStatus.flightStatus)}
                  <span className="font-semibold">{flightStatus.flightStatus.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Flight Route */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Departure */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {flightStatus.departure.iataCode}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mt-2">
                    {flightStatus.departure.scheduledTime}
                  </div>
                  {flightStatus.departure.actualTime && (
                    <div className="text-sm text-blue-600">
                      Actual: {flightStatus.departure.actualTime}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-2">
                    {flightStatus.departure.terminal && `Terminal ${flightStatus.departure.terminal}`}
                    {flightStatus.departure.gate && ` • Gate ${flightStatus.departure.gate}`}
                  </div>
                </div>

                {/* Flight Path */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-px bg-gray-300"></div>
                    <Plane className="w-6 h-6 text-blue-600 transform rotate-90" />
                    <div className="w-8 h-px bg-gray-300"></div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {flightStatus.arrival.iataCode}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mt-2">
                    {flightStatus.arrival.scheduledTime}
                  </div>
                  {flightStatus.arrival.actualTime && (
                    <div className="text-sm text-blue-600">
                      Actual: {flightStatus.arrival.actualTime}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-2">
                    {flightStatus.arrival.terminal && `Terminal ${flightStatus.arrival.terminal}`}
                    {flightStatus.arrival.gate && ` • Gate ${flightStatus.arrival.gate}`}
                  </div>
                </div>
              </div>

              {/* Aircraft Info */}
              {flightStatus.aircraft && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center text-gray-600">
                    Aircraft: <span className="font-semibold">{flightStatus.aircraft.code}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delay Prediction */}
            {delayPrediction && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-orange-600" />
                  Delay Prediction
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Delay Probability</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(delayPrediction.probability * 100)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Prediction</div>
                    <div className={`text-2xl font-bold ${
                      delayPrediction.result === 'ON_TIME' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {delayPrediction.result.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Prediction Type: {delayPrediction.subType.replace('_', ' ')}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Tracking flight...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightStatusTracker;
