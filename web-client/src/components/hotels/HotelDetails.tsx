import React, { useState } from 'react';
import { Building2, Star, MapPin, Calendar, Wifi, School as Pool, Coffee, ParkingMeter as Parking, Shield, ChevronDown, ChevronUp, ArrowRight, X } from 'lucide-react';
import type { HotelOffer } from '../../services/api/types';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">Hotel Details</h2>
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Hotel Summary */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <h3 className="font-medium text-base md:text-lg">{hotel.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-400 fill-orange-400" />
                    <span className="text-sm md:text-base">{hotel.rating}</span>
                  </div>
                </div>
                <div className="text-xs md:text-sm text-gray-500">{hotel.chainCode}</div>
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">
                {hotel.price.currency} {hotel.price.total}
              </div>
              <div className="text-xs md:text-sm text-gray-500">per night</div>
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">About the Hotel</h3>
            <p className="text-sm md:text-base text-gray-600">{hotel.description.text}</p>
          </div>

          {/* Room Types */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Available Rooms</h3>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-sm md:text-base">{hotel.room.type}</h4>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{hotel.room.description.text}</p>
                  <div className="mt-2 text-xs md:text-sm">
                    <span className="text-gray-600">Bed Type: </span>
                    <span className="font-medium">{hotel.room.typeEstimated.bedType}</span>
                  </div>
                </div>
                <button
                  onClick={onSelectRoom}
                  className="w-full md:w-auto min-h-[44px] px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm md:text-base font-medium"
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
          <div className="border-t border-gray-200 pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">Base rate</span>
                <span>{hotel.price.currency} {hotel.price.base}</span>
              </div>
              {hotel.price.fees.map((fee, index) => (
                <div key={index} className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">{fee.type}</span>
                  <span>{hotel.price.currency} {fee.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-sm md:text-base">
                <span>Total Price</span>
                <span>{hotel.price.currency} {hotel.price.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <button
              onClick={onBack}
              className="order-2 md:order-1 w-full md:w-auto min-h-[44px] px-4 md:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm md:text-base font-medium border border-gray-300 md:border-0 rounded-lg md:rounded-none"
            >
              Back to Results
            </button>
            <button
              onClick={onSelectRoom}
              className="order-1 md:order-2 w-full md:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base font-medium"
            >
              <span>Select Room</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;