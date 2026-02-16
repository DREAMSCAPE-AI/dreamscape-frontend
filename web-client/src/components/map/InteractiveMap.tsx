import React, { useState } from 'react';
import { MapPin, Hotel, Compass, Info, X, ExternalLink } from 'lucide-react';
import type { Experience, HotelOffer } from '@/services/voyage/types';

interface InteractiveMapProps {
  center: {
    lat: number;
    lng: number;
  };
  hotels?: HotelOffer[];
  activities?: Experience[];
  onMarkerClick?: (item: HotelOffer | Experience) => void;
}

interface MapMarker {
  id: string;
  type: 'hotel' | 'activity';
  lat: number;
  lng: number;
  title: string;
  description?: string;
  image?: string;
  price?: {
    amount: number;
    currency: string;
  };
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  hotels = [],
  activities = [],
  onMarkerClick
}) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'hotels' | 'activities'>('all');

  // Convert hotels and activities to map markers
  const markers: MapMarker[] = [
    ...hotels.map(hotel => ({
      id: hotel.id,
      type: 'hotel' as const,
      lat: parseFloat(hotel.latitude),
      lng: parseFloat(hotel.longitude),
      title: hotel.name,
      description: hotel.description?.text,
      image: hotel.media[0]?.uri,
      price: {
        amount: parseFloat(hotel.price.total),
        currency: hotel.price.currency
      }
    })),
    ...activities.map(activity => ({
      id: activity.id,
      type: 'activity' as const,
      lat: parseFloat(activity.latitude),
      lng: parseFloat(activity.longitude),
      title: activity.title,
      description: activity.description,
      image: activity.images[0],
      price: activity.price
    }))
  ];

  const filteredMarkers = markers.filter(marker => 
    activeCategory === 'all' || marker.type === activeCategory
  );

  return (
    <div className="relative h-[600px] bg-gray-100 rounded-xl overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('hotels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeCategory === 'hotels'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <Hotel className="w-4 h-4" />
            Hotels
          </button>
          <button
            onClick={() => setActiveCategory('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeCategory === 'activities'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            Activities
          </button>
        </div>
      </div>

      {/* Map Markers */}
      <div className="absolute inset-0">
        {filteredMarkers.map((marker) => (
          <button
            key={marker.id}
            onClick={() => setSelectedMarker(marker)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${
              selectedMarker?.id === marker.id ? 'z-30' : 'z-20'
            }`}
            style={{
              left: `${((marker.lng - center.lng + 180) % 360 - 180) * (100/360)}%`,
              top: `${((marker.lat - center.lat + 90) % 180 - 90) * -(100/180)}%`
            }}
          >
            <div className="relative">
              <div className={`p-2 rounded-full transition-colors ${
                marker.type === 'hotel'
                  ? 'bg-blue-500 group-hover:bg-blue-600'
                  : 'bg-orange-500 group-hover:bg-orange-600'
              }`}>
                {marker.type === 'hotel' ? (
                  <Hotel className="w-4 h-4 text-white" />
                ) : (
                  <Compass className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg p-2 text-left">
                  <div className="font-medium text-sm truncate">{marker.title}</div>
                  {marker.price && (
                    <div className="text-sm text-orange-500">
                      From {marker.price.currency} {marker.price.amount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Marker Details */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-40">
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex gap-4">
            {selectedMarker.image && (
              <img
                src={selectedMarker.image}
                alt={selectedMarker.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{selectedMarker.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {selectedMarker.lat.toFixed(6)}, {selectedMarker.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
                {selectedMarker.price && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-500">
                      {selectedMarker.price.currency} {selectedMarker.price.amount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedMarker.type === 'hotel' ? 'per night' : 'per person'}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedMarker.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {selectedMarker.description}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onMarkerClick?.(
                    markers.find(m => m.id === selectedMarker.id) as any
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-gray-600">
        Map data © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default InteractiveMap;