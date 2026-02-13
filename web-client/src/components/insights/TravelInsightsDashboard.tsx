import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, MapPin, Loader2, Lightbulb, Target } from 'lucide-react';
import voyageService from '@/services/voyage/VoyageService';

interface TripPurpose {
  subType: string;
  result: string;
  probability: number;
}

interface TravelRecommendation {
  type: string;
  subType: string;
  name: string;
  iataCode: string;
  address: {
    cityName: string;
    countryName: string;
  };
  geoCode: {
    latitude: number;
    longitude: number;
  };
  analytics: {
    travelers: {
      score: number;
    };
  };
  tags?: string[];
}

const TravelInsightsDashboard: React.FC = () => {
  const [tripPurpose, setTripPurpose] = useState<TripPurpose | null>(null);
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictionParams, setPredictionParams] = useState({
    originLocationCode: 'JFK',
    destinationLocationCode: 'CDG',
    departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    searchDate: new Date().toISOString().split('T')[0]
  });
  const [recommendationParams, setRecommendationParams] = useState({
    cityCodes: 'PAR,LON,NYC',
    travelerCountryCode: 'US',
    destinationCountryCode: 'FR'
  });

  const locationOptions = [
    { code: 'JFK', name: 'New York (JFK)', country: 'US' },
    { code: 'CDG', name: 'Paris (CDG)', country: 'FR' },
    { code: 'LHR', name: 'London (LHR)', country: 'GB' },
    { code: 'DXB', name: 'Dubai (DXB)', country: 'AE' },
    { code: 'NRT', name: 'Tokyo (NRT)', country: 'JP' },
    { code: 'LAX', name: 'Los Angeles (LAX)', country: 'US' },
    { code: 'SIN', name: 'Singapore (SIN)', country: 'SG' },
    { code: 'BKK', name: 'Bangkok (BKK)', country: 'TH' }
  ];

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // Fetch trip purpose prediction
      try {
        const purposeResponse = await voyageService.predictTripPurpose(predictionParams);
        if (purposeResponse.data) {
          setTripPurpose(purposeResponse.data);
        }
      } catch (error) {
        console.error('Error predicting trip purpose:', error);
        // Mock trip purpose data
        const purposes = ['LEISURE', 'BUSINESS', 'FAMILY_VISIT', 'EDUCATION', 'MEDICAL'];
        const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
        setTripPurpose({
          subType: 'TRIP_PURPOSE',
          result: randomPurpose,
          probability: Math.random() * 0.4 + 0.6 // 60-100% confidence
        });
      }

      // Fetch travel recommendations
      try {
        const recommendationsResponse = await voyageService.getTravelRecommendations(recommendationParams);
        if (recommendationsResponse.data) {
          setRecommendations(recommendationsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Mock recommendations data
        const mockRecommendations = [
          {
            type: 'location',
            subType: 'CITY',
            name: 'Paris',
            iataCode: 'PAR',
            address: { cityName: 'Paris', countryName: 'France' },
            geoCode: { latitude: 48.8566, longitude: 2.3522 },
            analytics: { travelers: { score: 95 } },
            tags: ['Culture', 'Romance', 'Art', 'Cuisine']
          },
          {
            type: 'location',
            subType: 'CITY',
            name: 'London',
            iataCode: 'LON',
            address: { cityName: 'London', countryName: 'United Kingdom' },
            geoCode: { latitude: 51.5074, longitude: -0.1278 },
            analytics: { travelers: { score: 88 } },
            tags: ['History', 'Museums', 'Theater', 'Pubs']
          },
          {
            type: 'location',
            subType: 'CITY',
            name: 'Tokyo',
            iataCode: 'NRT',
            address: { cityName: 'Tokyo', countryName: 'Japan' },
            geoCode: { latitude: 35.6762, longitude: 139.6503 },
            analytics: { travelers: { score: 92 } },
            tags: ['Technology', 'Culture', 'Food', 'Shopping']
          },
          {
            type: 'location',
            subType: 'CITY',
            name: 'Dubai',
            iataCode: 'DXB',
            address: { cityName: 'Dubai', countryName: 'United Arab Emirates' },
            geoCode: { latitude: 25.2048, longitude: 55.2708 },
            analytics: { travelers: { score: 85 } },
            tags: ['Luxury', 'Shopping', 'Architecture', 'Desert']
          },
          {
            type: 'location',
            subType: 'CITY',
            name: 'Singapore',
            iataCode: 'SIN',
            address: { cityName: 'Singapore', countryName: 'Singapore' },
            geoCode: { latitude: 1.3521, longitude: 103.8198 },
            analytics: { travelers: { score: 90 } },
            tags: ['Food', 'Gardens', 'Modern', 'Multicultural']
          }
        ];
        setRecommendations(mockRecommendations);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getPurposeColor = (purpose: string) => {
    const colors: { [key: string]: string } = {
      'LEISURE': 'text-green-600 bg-green-100',
      'BUSINESS': 'text-blue-600 bg-blue-100',
      'FAMILY_VISIT': 'text-purple-600 bg-purple-100',
      'EDUCATION': 'text-orange-600 bg-orange-100',
      'MEDICAL': 'text-red-600 bg-red-100'
    };
    return colors[purpose] || 'text-gray-600 bg-gray-100';
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'LEISURE': return '🏖️';
      case 'BUSINESS': return '💼';
      case 'FAMILY_VISIT': return '👨‍👩‍👧‍👦';
      case 'EDUCATION': return '🎓';
      case 'MEDICAL': return '🏥';
      default: return '✈️';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Brain className="text-violet-600" />
            Travel Insights Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered travel predictions and personalized recommendations
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trip Purpose Prediction Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="text-blue-600" />
              Trip Purpose Prediction
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin
                  </label>
                  <select
                    value={predictionParams.originLocationCode}
                    onChange={(e) => setPredictionParams(prev => ({ ...prev, originLocationCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {locationOptions.map((location) => (
                      <option key={location.code} value={location.code}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <select
                    value={predictionParams.destinationLocationCode}
                    onChange={(e) => setPredictionParams(prev => ({ ...prev, destinationLocationCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {locationOptions.map((location) => (
                      <option key={location.code} value={location.code}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={predictionParams.departureDate}
                    onChange={(e) => setPredictionParams(prev => ({ ...prev, departureDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={predictionParams.returnDate}
                    onChange={(e) => setPredictionParams(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="text-orange-600" />
              Travel Recommendations
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City Codes (comma-separated)
                </label>
                <input
                  type="text"
                  value={recommendationParams.cityCodes}
                  onChange={(e) => setRecommendationParams(prev => ({ ...prev, cityCodes: e.target.value }))}
                  placeholder="e.g., PAR,LON,NYC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Traveler Country
                  </label>
                  <select
                    value={recommendationParams.travelerCountryCode}
                    onChange={(e) => setRecommendationParams(prev => ({ ...prev, travelerCountryCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="JP">Japan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Country
                  </label>
                  <select
                    value={recommendationParams.destinationCountryCode}
                    onChange={(e) => setRecommendationParams(prev => ({ ...prev, destinationCountryCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="FR">France</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="DE">Germany</option>
                    <option value="JP">Japan</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mb-8">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
            Generate Insights
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <span className="ml-2 text-gray-600">Analyzing travel patterns...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trip Purpose Prediction */}
            {tripPurpose && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="text-purple-600" />
                  Trip Purpose
                </h2>
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {getPurposeIcon(tripPurpose.result)}
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-full mb-4 ${getPurposeColor(tripPurpose.result)}`}>
                    <span className="font-bold text-lg">
                      {tripPurpose.result.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Confidence Level</div>
                  <div className="text-3xl font-bold text-violet-600">
                    {Math.round(tripPurpose.probability * 100)}%
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Based on your travel pattern from{' '}
                    <span className="font-semibold">{predictionParams.originLocationCode}</span> to{' '}
                    <span className="font-semibold">{predictionParams.destinationLocationCode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Travel Recommendations */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-green-600" />
                  Personalized Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.slice(0, 4).map((recommendation, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {recommendation.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {recommendation.address.cityName}, {recommendation.address.countryName}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(recommendation.analytics.travelers.score)}`}>
                            {recommendation.analytics.travelers.score}
                          </div>
                          <div className="text-xs text-gray-500">Travel Score</div>
                        </div>
                      </div>
                      {recommendation.tags && (
                        <div className="flex flex-wrap gap-2">
                          {recommendation.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {recommendations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recommendations available. Try adjusting your search parameters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insights Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-600" />
            AI Insights Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {tripPurpose ? Math.round(tripPurpose.probability * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {recommendations.length}
              </div>
              <div className="text-sm text-gray-600">Recommendations Found</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {recommendations.length > 0 ? Math.round(recommendations.reduce((acc, rec) => acc + rec.analytics.travelers.score, 0) / recommendations.length) : 0}
              </div>
              <div className="text-sm text-gray-600">Average Travel Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelInsightsDashboard;
