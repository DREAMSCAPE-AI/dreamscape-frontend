import React from 'react';
import { MapPin } from 'lucide-react';

const MapView = () => {
  return (
    <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-gray-400 flex flex-col items-center">
          <MapPin className="w-8 h-8 mb-2" />
          <p>Interactive map will be loaded here</p>
          <p className="text-sm">Showing search results geographically</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;