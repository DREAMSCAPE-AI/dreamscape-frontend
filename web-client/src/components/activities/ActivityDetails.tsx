import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
  Check,
  XCircle,
  Minus,
  Plus
} from 'lucide-react';
import type { Activity } from './ActivityResults';
import imageService from '@/services/imageService';
import { useActivityBookingStore } from '@/store/activityBookingStore';

interface ActivityDetailsProps {
  activity: Activity;
  onClose: () => void;
  onAccept: () => void;
  onBack: () => void;
}

const ActivityDetails: React.FC<ActivityDetailsProps> = ({
  activity,
  onClose,
  onAccept,
  onBack
}) => {
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [showWhatsIncluded, setShowWhatsIncluded] = useState(false);

  // Get number of participants from store
  const { numberOfParticipants, setNumberOfParticipants } = useActivityBookingStore();

  const handleParticipantsChange = (change: number) => {
    const newCount = Math.max(1, Math.min(20, numberOfParticipants + change));
    setNumberOfParticipants(newCount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Activity Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Activity Summary */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              {/* Category Tag */}
              <div className="mb-3">
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  {activity.category}
                </span>
              </div>

              {/* Activity Name */}
              <div className="text-xl font-bold text-gray-900 mb-2">
                {activity.name}
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{activity.location.name}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-semibold text-gray-900 mr-1">
                    {activity.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({activity.reviewCount} reviews)
                  </span>
                </div>

                {/* Key Info */}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{activity.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{activity.groupSize}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">From</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {activity.price.formatted}
              </div>
              <div className="text-sm text-gray-500">per person</div>
            </div>
          </div>
        </div>

        {/* Activity Images */}
        {activity.images.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              {activity.images.slice(0, 3).map((image, index) => (
                <div key={index} className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${activity.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = imageService.getFallbackImage('activity');
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Details */}
        <div className="p-6 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {activity.description}
            </p>
          </div>

          {/* Highlights */}
          {activity.tags && activity.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What's Included */}
          <div>
            <button
              onClick={() => setShowWhatsIncluded(!showWhatsIncluded)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">What's Included</span>
              </div>
              {showWhatsIncluded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showWhatsIncluded && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Included Items - Example based on typical activity inclusions */}
                  <div>
                    <h4 className="font-medium text-green-600 mb-2 flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      Included
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Professional guide
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        All necessary equipment
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Entry/admission fees
                      </li>
                      {activity.bookingInfo.instantConfirmation && (
                        <li className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          Instant confirmation
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      Not Included
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start">
                        <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                        Hotel pickup and drop-off
                      </li>
                      <li className="flex items-start">
                        <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                        Food and drinks
                      </li>
                      <li className="flex items-start">
                        <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                        Gratuities
                      </li>
                      <li className="flex items-start">
                        <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                        Personal expenses
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cancellation Policy */}
          <div>
            <button
              onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Cancellation Policy</span>
              </div>
              {showCancellationPolicy ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showCancellationPolicy && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-1">
                      {activity.bookingInfo.freeCancellation ? 'Free Cancellation' : 'Standard Cancellation'}
                    </div>
                    <p className="text-gray-600">
                      {activity.bookingInfo.cancellationPolicy}
                    </p>
                  </div>
                </div>
                {activity.bookingInfo.freeCancellation && (
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium mb-1">Flexible Booking</div>
                      <p className="text-gray-600">
                        Cancel or reschedule your booking up to 24 hours before the activity starts
                        for a full refund.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meeting Point */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Meeting Point</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium mb-1">{activity.location.name}</div>
                  <p className="text-sm text-gray-600">
                    {activity.location.address || 'Meeting point will be confirmed upon booking'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Availability</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  activity.availability.available ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {activity.availability.available ? 'Available' : 'Currently Unavailable'}
                </span>
              </div>
              {activity.availability.available && activity.availability.nextAvailable && (
                <p className="text-sm text-gray-600">
                  Next available: {new Date(activity.availability.nextAvailable).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Important Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Important Information</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• Please arrive 15 minutes before the activity starts</p>
                  <p>• Wear comfortable shoes and weather-appropriate clothing</p>
                  <p>• Bring a valid photo ID for verification</p>
                  {activity.bookingInfo.instantConfirmation && (
                    <p>• You will receive instant confirmation after booking</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Number of Participants */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Number of Participants</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between max-w-xs">
                <button
                  onClick={() => handleParticipantsChange(-1)}
                  disabled={numberOfParticipants <= 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span className="text-xl font-semibold">{numberOfParticipants}</span>
                  <span className="text-gray-600">
                    {numberOfParticipants === 1 ? 'person' : 'people'}
                  </span>
                </div>
                <button
                  onClick={() => handleParticipantsChange(1)}
                  disabled={numberOfParticipants >= 20}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Price per person: {activity.price.formatted}
              </p>
              <p className="text-lg font-semibold text-orange-600 mt-1">
                Total: {activity.price.currency} {(activity.price.amount * numberOfParticipants).toFixed(2)}
              </p>
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
              onClick={onAccept}
              disabled={!activity.availability.available}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Booking</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
