import React, { useState } from 'react';
import { Wifi, Coffee, Users, MapPin, Star, Clock, DollarSign, Laptop, Building2 } from 'lucide-react';

interface WorkspaceExplorerProps {
  workspaces: Workspace[];
  onBook: (workspace: Workspace) => void;
}

interface Workspace {
  id: string;
  name: string;
  type: 'coworking' | 'cafe' | 'library' | 'hotel';
  location: string;
  rating: number;
  wifiSpeed: number;
  pricePerDay: number;
  amenities: string[];
  images: string[];
  openingHours: string;
  currentOccupancy?: number;
}

const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({
  workspaces,
  onBook
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: 'All Spaces', icon: Building2 },
    { id: 'coworking', label: 'Coworking', icon: Users },
    { id: 'cafe', label: 'Cafes', icon: Coffee },
    { id: 'quiet', label: 'Quiet Spaces', icon: Laptop }
  ];

  const filteredWorkspaces = workspaces.filter(workspace => 
    selectedFilter === 'all' || workspace.type === selectedFilter
  );

  const getWifiSpeedLabel = (speed: number) => {
    if (speed >= 100) return 'Very Fast';
    if (speed >= 50) return 'Fast';
    if (speed >= 20) return 'Good';
    return 'Basic';
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {filters.map(filter => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={workspace.images[0]}
                alt={workspace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              
              {/* WiFi Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm flex items-center gap-1">
                <Wifi className="w-4 h-4" />
                <span>{workspace.wifiSpeed} Mbps</span>
              </div>

              {/* Occupancy Badge */}
              {workspace.currentOccupancy !== undefined && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-sm">
                  <span className={workspace.currentOccupancy > 80 ? 'text-red-500' : 'text-green-500'}>
                    {100 - workspace.currentOccupancy}% Available
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{workspace.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">{workspace.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{workspace.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{workspace.openingHours}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${workspace.pricePerDay}/day</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {workspace.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              {/* WiFi Speed Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">WiFi Speed</span>
                  <span className="font-medium">{getWifiSpeedLabel(workspace.wifiSpeed)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${Math.min((workspace.wifiSpeed / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => onBook(workspace)}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Book Workspace
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceExplorer;