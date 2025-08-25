import React from 'react';
import { Sliders, Car, Clock, DollarSign, Shield } from 'lucide-react';

interface TransferFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

const TransferFilters: React.FC<TransferFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const vehicleTypes = [
    'Economy', 'Standard', 'Business', 'Luxury', 'Van', 'Bus'
  ];

  const features = [
    'Meet & Greet',
    'Flight Tracking',
    'Free Cancellation',
    'Child Seats Available'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      {/* Vehicle Types */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Vehicle Type</h3>
        <div className="space-y-2">
          {vehicleTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <div className="flex items-center gap-2 text-gray-700 group-hover:text-orange-500 transition-colors">
                <Car className="w-4 h-4" />
                <span>{type}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="500"
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>$0</span>
            <span>$500+</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Features</h3>
        <div className="space-y-2">
          {features.map((feature) => (
            <label key={feature} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-700 group-hover:text-orange-500 transition-colors">
                {feature}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Pickup Time */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Pickup Time</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Early Morning', 'Morning', 'Afternoon', 'Evening'].map((time) => (
            <button
              key={time}
              className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-orange-50 hover:text-orange-500 transition-colors text-sm"
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransferFilters;