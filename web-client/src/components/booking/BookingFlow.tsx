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
      <div className="h-2 bg-gray-100 rounded-t-xl">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-l-xl transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold">Complete Your Booking</h2>
        <div className="flex items-center gap-4 mt-4">
          {[
            { step: 1, label: 'Travelers', icon: Users },
            { step: 2, label: 'Preferences', icon: Shield },
            { step: 3, label: 'Contact', icon: AlertCircle },
            { step: 4, label: 'Payment', icon: CreditCard }
          ].map(({ step: stepNum, label, icon: Icon }) => (
            <div
              key={stepNum}
              className={`flex items-center gap-2 ${
                step >= stepNum ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= stepNum ? 'bg-orange-50' : 'bg-gray-50'
              }`}>
                {step > stepNum ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={step >= stepNum ? 'font-medium' : ''}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Traveler Information</h3>
            {/* Passenger forms would go here */}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Travel Preferences</h3>
            {/* Preferences forms would go here */}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Details</h3>
            {/* Contact forms would go here */}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Payment</h3>
            {/* Payment forms would go here */}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
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