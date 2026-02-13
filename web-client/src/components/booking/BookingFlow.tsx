import React, { useState } from 'react';
import { Calendar, Users, CreditCard, Shield, AlertCircle, Check } from 'lucide-react';
import type { FlightOffer, HotelOffer, Experience } from '@/services/voyage/types';

interface BookingFlowProps {
  items: (FlightOffer | HotelOffer | Experience)[];
  onComplete: (bookingDetails: BookingDetails) => void;
  onCancel: () => void;
}

interface BookingDetails {
  items: (FlightOffer | HotelOffer | Experience)[];
  passengers: Passenger[];
  paymentMethod: PaymentMethod;
  contactDetails: ContactDetails;
  preferences: BookingPreferences;
}

interface Passenger {
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  specialRequests?: string[];
}

interface PaymentMethod {
  type: 'card' | 'paypal';
  details: any;
}

interface ContactDetails {
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface BookingPreferences {
  seatPreference?: string;
  mealPreference?: string;
  accessibility?: string[];
  otherRequests?: string;
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  items,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    items,
    passengers: [],
    paymentMethod: { type: 'card', details: {} },
    contactDetails: {
      email: '',
      phone: '',
      emergencyContact: { name: '', relationship: '', phone: '' }
    },
    preferences: {}
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(bookingDetails);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 rounded-t-xl" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-l-xl transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="p-3 md:p-4 lg:p-6 border-b border-gray-200">
        <h2 className="text-lg md:text-2xl font-semibold">Complete Your Booking</h2>

        {/* Mobile: Horizontal scroll */}
        <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 mt-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-max md:min-w-0">
            {[
              { step: 1, label: 'Travelers', icon: Users },
              { step: 2, label: 'Preferences', icon: Shield },
              { step: 3, label: 'Contact', icon: AlertCircle },
              { step: 4, label: 'Payment', icon: CreditCard }
            ].map(({ step: stepNum, label, icon: Icon }) => (
              <div
                key={stepNum}
                className={`flex items-center gap-2 flex-shrink-0 ${
                  step >= stepNum ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                <div className={`w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step >= stepNum ? 'bg-orange-50' : 'bg-gray-50'
                }`}>
                  {step > stepNum ? (
                    <Check className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  )}
                </div>
                <span className={`text-xs md:text-base whitespace-nowrap ${step >= stepNum ? 'font-medium' : ''}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 lg:p-6">
        {step === 1 && (
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-semibold">Traveler Information</h3>
            {/* Passenger forms would go here */}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-semibold">Travel Preferences</h3>
            {/* Preferences forms would go here */}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-semibold">Contact Details</h3>
            {/* Contact forms would go here */}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-semibold">Payment</h3>
            {/* Payment forms would go here */}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 md:p-4 lg:p-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <button
            onClick={onCancel}
            className="px-4 md:px-6 py-2.5 min-h-[44px] text-sm md:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors order-2 sm:order-1"
            aria-label="Cancel booking"
          >
            Cancel
          </button>
          <div className="flex gap-3 sm:gap-4 order-1 sm:order-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 min-h-[44px] text-sm md:text-base bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Go back to previous step"
              >
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">← Back</span>
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 min-h-[48px] text-sm md:text-base font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              aria-label={step === totalSteps ? 'Complete booking' : 'Continue to next step'}
            >
              {step === totalSteps ? 'Complete Booking' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;