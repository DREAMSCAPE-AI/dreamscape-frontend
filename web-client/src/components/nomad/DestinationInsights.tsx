import React from 'react';
import { Wifi, Home, DollarSign, Users, Globe, Sun, ThermometerSun, Coffee } from 'lucide-react';

interface DestinationInsightsProps {
  destination: {
    name: string;
    country: string;
    overview: string;
    costOfLiving: CostOfLiving;
    infrastructure: Infrastructure;
    climate: Climate;
    community: Community;
  };
}

interface CostOfLiving {
  currency: string;
  monthlyEstimates: {
    accommodation: number;
    coworking: number;
    food: number;
    transport: number;
    entertainment: number;
  };
  comparisonToUSA: number;
}

interface Infrastructure {
  averageWifiSpeed: number;
  powerReliability: number;
  publicTransport: number;
  coworkingSpaces: number;
  cafes: number;
}

interface Climate {
  bestTimeToVisit: string[];
  averageTemperature: number;
  humidity: number;
  rainySeasons: string[];
}

interface Community {
  nomadScore: number;
  expatsCount: number;
  events: string[];
  groups: string[];
}

const DestinationInsights: React.FC<DestinationInsightsProps> = ({ destination }) => {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">{destination.name}</h2>
        <p className="text-gray-600 mb-6">{destination.overview}</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Wifi className="w-4 h-4" />
              <span>Avg. WiFi</span>
            </div>
            <div className="text-xl font-bold">{destination.infrastructure.averageWifiSpeed} Mbps</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Cost Index</span>
            </div>
            <div className="text-xl font-bold">{destination.costOfLiving.comparisonToUSA}%</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Users className="w-4 h-4" />
              <span>Nomad Score</span>
            </div>
            <div className="text-xl font-bold">{destination.community.nomadScore}/100</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Coffee className="w-4 h-4" />
              <span>Workspaces</span>
            </div>
            <div className="text-xl font-bold">{destination.infrastructure.coworkingSpaces}+</div>
          </div>
        </div>
      </div>

      {/* Cost of Living */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Cost of Living</h3>
        <div className="space-y-4">
          {Object.entries(destination.costOfLiving.monthlyEstimates).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {category === 'accommodation' && <Home className="w-4 h-4 text-gray-400" />}
                {category === 'coworking' && <Laptop className="w-4 h-4 text-gray-400" />}
                {category === 'food' && <Coffee className="w-4 h-4 text-gray-400" />}
                {category === 'transport' && <Bus className="w-4 h-4 text-gray-400" />}
                {category === 'entertainment' && <Music className="w-4 h-4 text-gray-400" />}
                <span className="capitalize">{category}</span>
              </div>
              <div className="font-medium">
                {destination.costOfLiving.currency} {amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Digital Infrastructure</h3>
        <div className="space-y-4">
          {/* WiFi Speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">WiFi Speed</span>
              <span className="font-medium">{destination.infrastructure.averageWifiSpeed} Mbps</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${Math.min((destination.infrastructure.averageWifiSpeed / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Power Reliability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Power Reliability</span>
              <span className="font-medium">{destination.infrastructure.powerReliability}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${destination.infrastructure.powerReliability}%` }}
              />
            </div>
          </div>

          {/* Public Transport */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Public Transport</span>
              <span className="font-medium">{destination.infrastructure.publicTransport}/10</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(destination.infrastructure.publicTransport / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Climate & Best Time */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Climate & Seasons</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature & Humidity */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <ThermometerSun className="w-5 h-5" />
              <span>Average Conditions</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Temperature</span>
                <span>{destination.climate.averageTemperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Humidity</span>
                <span>{destination.climate.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Best Time to Visit */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Sun className="w-5 h-5" />
              <span>Best Time to Visit</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {destination.climate.bestTimeToVisit.map((month) => (
                <span
                  key={month}
                  className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                >
                  {month}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Nomad Community */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Community</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Globe className="w-5 h-5" />
              <span>Community Stats</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Digital Nomads</span>
                <span>{destination.community.expatsCount}+ active</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Events</span>
                <span>{destination.community.events.length}</span>
              </div>
            </div>
          </div>

          {/* Community Groups */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Users className="w-5 h-5" />
              <span>Active Groups</span>
            </div>
            <div className="space-y-2">
              {destination.community.groups.map((group, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded-lg text-sm">
                  {group}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationInsights;