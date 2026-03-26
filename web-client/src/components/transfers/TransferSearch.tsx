import React, { useState } from 'react';
import { MapPin, Calendar, Users, Car, Search } from 'lucide-react';
import { useTransferSearch } from '../../hooks/useAPI';
import Calendar from '../shared/Calendar';
import Dropdown from '../shared/Dropdown';
import type { TransferSearchParams } from '@/services/voyage/types';

const TransferSearch = () => {
  const { searchTransfers, loading, error } = useTransferSearch();
  const [searchParams, setSearchParams] = useState<TransferSearchParams>({
    pickup: '',
    dropoff: '',
    datetime: '',
    passengers: 2
  });

  const handleSearch = async () => {
    try {
      const results = await searchTransfers(searchParams);
      // Handle results
    } catch (error) {
      console.error('Transfer search failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Book Your Transfer</h2>
      
      <div className="space-y-6">
        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Airport, hotel, or address"
              value={searchParams.pickup}
              onChange={(e) => setSearchParams({ ...searchParams, pickup: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Dropoff Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dropoff Location
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Hotel, address, or landmark"
              value={searchParams.dropoff}
              onChange={(e) => setSearchParams({ ...searchParams, dropoff: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Date & Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Date & Time
            </label>
            <Calendar
              onSelect={(date) => setSearchParams({
                ...searchParams,
                datetime: date.toISOString()
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passengers
            </label>
            <Dropdown
              options={[
                { value: '1', label: '1 Passenger' },
                { value: '2', label: '2 Passengers' },
                { value: '3', label: '3 Passengers' },
                { value: '4', label: '4 Passengers' }
              ]}
              value={searchParams.passengers.toString()}
              onChange={(value) => setSearchParams({ ...searchParams, passengers: parseInt(value) })}
              icon={<Users className="w-5 h-5 text-gray-400" />}
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'economy', label: 'Economy', price: '$30' },
              { type: 'business', label: 'Business', price: '$50' },
              { type: 'luxury', label: 'Luxury', price: '$80' }
            ].map((vehicle) => (
              <button
                key={vehicle.type}
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 transition-colors group"
              >
                <Car className="w-6 h-6 text-gray-400 group-hover:text-orange-500 mb-2" />
                <div className="font-medium">{vehicle.label}</div>
                <div className="text-sm text-gray-500">from {vehicle.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Search Transfers</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferSearch;