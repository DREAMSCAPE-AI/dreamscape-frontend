import React, { useState } from 'react';
import { Building2, Star, MapPin, Calendar, Wifi, School as Pool, Coffee, ParkingMeter as Parking, Shield, ChevronDown, ChevronUp, ArrowRight, X } from 'lucide-react';
import type { HotelOffer } from '@/services/voyage/types';

interface HotelDetailsProps {
  hotel: HotelOffer;
  onClose: () => void;
  onSelectRoom: () => void;
  onBack: () => void;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({
  hotel,
  onClose,
  onSelectRoom,
  onBack
}) => {
  const [showPolicies, setShowPolicies] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);

  const amenityIcons: { [key: string]: any } = {
    WIFI: Wifi,
    POOL: Pool,
    RESTAURANT: Coffee,
    PARKING: Parking
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Hotel Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hotel Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{hotel.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-400" />
                    <span>{hotel.rating}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{hotel.chainCode}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {hotel.price.currency} {hotel.price.total}
              </div>
              <div className="text-sm text-gray-500">per night</div>
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="p-6 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About the Hotel</h3>
            <p className="text-gray-600">{hotel.description.text}</p>
          </div>

          {/* Room Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Rooms</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{hotel.room.type}</h4>
                  <p className="text-sm text-gray-600">{hotel.room.description.text}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Bed Type: </span>
                    <span className="font-medium">{hotel.room.typeEstimated.bedType}</span>
                  </div>
                </div>
                <button
                  onClick={onSelectRoom}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Select Room
                </button>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <button
              onClick={() => setShowAmenities(!showAmenities)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Hotel Amenities</span>
              </div>
              {showAmenities ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showAmenities && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Building2;
                  return (
                    <div key={amenity} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">
                        {amenity.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Policies */}
          <div>
            <button
              onClick={() => setShowPolicies(!showPolicies)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Hotel Policies</span>
              </div>
              {showPolicies ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showPolicies && (
              <div className="mt-4 space-y-4">
                {hotel.policies.map((policy, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">{policy.type.replace(/_/g, ' ')}</h4>
                    <p className="text-sm text-gray-600">{policy.description.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base rate</span>
                <span>{hotel.price.currency} {hotel.price.base}</span>
              </div>
              {hotel.price.fees.map((fee, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{fee.type}</span>
                  <span>{hotel.price.currency} {fee.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>Total Price</span>
                <span>{hotel.price.currency} {hotel.price.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Results
            </button>
            <button
              onClick={onSelectRoom}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <span>Select Room</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;