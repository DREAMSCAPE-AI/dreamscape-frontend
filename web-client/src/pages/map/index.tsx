import React from 'react';
import MapExplorer from '@/components/map/MapExplorer';

export default function MapPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Explore Destinations</h1>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>
        </div>
        <MapExplorer />
      </div>
    </main>
  );
}