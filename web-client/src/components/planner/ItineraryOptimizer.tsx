import React, { useState } from 'react';
import { Sparkles, Clock, MapPin, Sun, Cloud, Umbrella, AlertCircle } from 'lucide-react';
import type { DayPlan } from './ItineraryBuilder';

interface ItineraryOptimizerProps {
  itinerary: DayPlan[];
  onOptimize: (optimizedItinerary: DayPlan[]) => void;
}

const ItineraryOptimizer: React.FC<ItineraryOptimizerProps> = ({
  itinerary,
  onOptimize
}) => {
  const [optimizing, setOptimizing] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const optimizationFactors = [
    {
      id: 'weather',
      label: 'Weather Conditions',
      icon: Sun,
      description: 'Adjust schedule based on weather forecasts'
    },
    {
      id: 'crowds',
      label: 'Crowd Levels',
      icon: Users,
      description: 'Optimize timing to avoid peak crowds'
    },
    {
      id: 'distance',
      label: 'Travel Distance',
      icon: MapPin,
      description: 'Minimize travel time between activities'
    },
    {
      id: 'hours',
      label: 'Opening Hours',
      icon: Clock,
      description: 'Consider venue operating hours'
    }
  ];

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      // Simulated optimization delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically call an API to optimize the itinerary
      const optimizedItinerary = [...itinerary]; // Replace with actual optimization
      onOptimize(optimizedItinerary);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-semibold">Optimize Your Itinerary</h2>
      </div>

      {/* Optimization Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {optimizationFactors.map((factor) => {
          const Icon = factor.icon;
          return (
            <button
              key={factor.id}
              onClick={() => {
                setSelectedFactors(prev =>
                  prev.includes(factor.id)
                    ? prev.filter(f => f !== factor.id)
                    : [...prev, factor.id]
                );
              }}
              className={`flex items-start gap-3 p-4 rounded-lg text-left transition-colors ${
                selectedFactors.includes(factor.id)
                  ? 'bg-orange-50 text-orange-600 border-2 border-orange-500'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{factor.label}</div>
                <div className="text-sm opacity-80">{factor.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Issues */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Potential Issues</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">High chance of rain during outdoor activities on Day 2</span>
          </div>
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Museum visit scheduled outside opening hours on Day 3</span>
          </div>
        </div>
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={optimizing || selectedFactors.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {optimizing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Optimize Itinerary</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ItineraryOptimizer;