import React from 'react';
import { Car, Clock, Users, Shield, Star } from 'lucide-react';
import type { Transfer } from '../../services/api/types';

interface TransferResultsProps {
  transfers: Transfer[];
  onSelect: (transfer: Transfer) => void;
}

const TransferResults: React.FC<TransferResultsProps> = ({ transfers, onSelect }) => {
  return (
    <div className="space-y-4">
      {transfers.map((transfer) => (
        <div
          key={transfer.id}
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Vehicle Type Icon */}
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Car className="w-8 h-8 text-gray-400" />
                </div>

                {/* Transfer Details */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{transfer.vehicleType}</h3>
                    <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                      {transfer.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Up to 4 passengers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{transfer.provider}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="text-right">
                <div className="flex items-baseline gap-1 justify-end mb-2">
                  <span className="text-2xl font-bold text-orange-500">
                    {transfer.price.currency}{transfer.price.amount}
                  </span>
                  <span className="text-sm text-gray-500">total</span>
                </div>
                <button
                  onClick={() => onSelect(transfer)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Select Transfer
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="px-6 py-3 bg-orange-50 border-t border-orange-100">
            <div className="flex items-center gap-4 text-sm text-orange-600">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Free cancellation up to 24h before</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Meet & greet included</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {transfers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transfers Found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or selecting different times
          </p>
        </div>
      )}
    </div>
  );
};

export default TransferResults;