import React, { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl';
import { Search, Filter, Loader, MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapExplorerProps {
  initialLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface Location {
  lat: number;
  lng: number;
  name: string;
  type: 'hotel' | 'activity';
  color: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapExplorer: React.FC<MapExplorerProps> = ({
  initialLocation = {
    lat: 48.8566,
    lng: 2.3522,
    name: 'Paris, France'
  }
}) => {
  const [viewState, setViewState] = useState({
    latitude: initialLocation.lat,
    longitude: initialLocation.lng,
    zoom: 12
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Sample locations
  const locations: Location[] = [
    { lat: 48.8566, lng: 2.3522, name: 'Paris', type: 'hotel', color: '#f97316' },
    { lat: 51.5074, lng: -0.1278, name: 'London', type: 'activity', color: '#3b82f6' },
    { lat: 40.7128, lng: -74.0060, name: 'New York', type: 'hotel', color: '#f97316' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo', type: 'activity', color: '#3b82f6' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate search
    setTimeout(() => {
      const foundLocation = locations.find(
        loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (foundLocation) {
        setViewState({
          latitude: foundLocation.lat,
          longitude: foundLocation.lng,
          zoom: 12
        });
      }

      setLoading(false);
    }, 1000);
  };

  const onMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mapbox Token Required</h3>
        <p className="text-gray-600">
          Please add your Mapbox token to the environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>
      </div>

      {/* Map Container */}
      <div className="relative h-[600px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <div className="flex items-center gap-2 text-white">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}
        
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {locations.map((location, index) => (
            <Marker
              key={index}
              latitude={location.lat}
              longitude={location.lng}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                onMarkerClick(location);
              }}
            >
              <div className="cursor-pointer transform transition-transform hover:scale-110">
                <MapPin
                  className="w-6 h-6"
                  style={{ color: location.color }}
                  strokeWidth={3}
                />
              </div>
            </Marker>
          ))}

          {selectedLocation && (
            <Popup
              latitude={selectedLocation.lat}
              longitude={selectedLocation.lng}
              anchor="bottom"
              onClose={() => setSelectedLocation(null)}
              closeButton={true}
              closeOnClick={false}
              className="z-50"
            >
              <div className="p-2">
                <h3 className="font-semibold">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {selectedLocation.type}
                </p>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Viewing {selectedLocation?.name || initialLocation.name}</span>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;