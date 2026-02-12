import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Globe, Import as Passport, AlertCircle, ArrowRight } from 'lucide-react';
import type { FlightOffer } from '../../services/api/types';

interface PassengerInfoProps {
  flight: FlightOffer;
  onBack: () => void;
  onContinue: (passengerDetails: PassengerDetails[]) => void;
}

interface PassengerDetails {
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email?: string;
  phone?: string;
  specialRequests?: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

const PassengerInfo: React.FC<PassengerInfoProps> = ({
  flight,
  onBack,
  onContinue
}) => {
  // Initialize with the number of passengers from the flight pricing
  const totalPassengers = flight.travelerPricings?.length || 1;

  const [passengers, setPassengers] = useState<PassengerDetails[]>([
    {
      type: 'adult',
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
      email: '',
      phone: '',
      specialRequests: []
    }
  ]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [currentPassenger, setCurrentPassenger] = useState(0);

  const titles = ['Mr', 'Mrs', 'Ms', 'Dr'];
  const specialRequests = [
    'Wheelchair Assistance',
    'Special Meal',
    'Extra Legroom',
    'Bassinet'
  ];

  const validatePassenger = (passenger: PassengerDetails): boolean => {
    const errors: ValidationErrors = {};
    const today = new Date();
    const minAdultAge = new Date();
    minAdultAge.setFullYear(minAdultAge.getFullYear() - 18);

    if (!passenger.title) {
      errors.title = 'Title is required';
    }
    if (!passenger.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!passenger.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!passenger.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(passenger.dateOfBirth);
      if (passenger.type === 'adult' && dob > minAdultAge) {
        errors.dateOfBirth = 'Adult passengers must be 18 or older';
      }
    }
    if (!passenger.nationality) {
      errors.nationality = 'Nationality is required';
    }
    if (!passenger.passportNumber) {
      errors.passportNumber = 'Passport number is required';
    }
    if (!passenger.passportExpiry) {
      errors.passportExpiry = 'Passport expiry date is required';
    } else {
      const expiry = new Date(passenger.passportExpiry);
      if (expiry <= today) {
        errors.passportExpiry = 'Passport must not be expired';
      }
    }
    if (currentPassenger === 0) {
      if (!passenger.email?.trim()) {
        errors.email = 'Email is required for the primary passenger';
      } else if (!/\S+@\S+\.\S+/.test(passenger.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!passenger.phone?.trim()) {
        errors.phone = 'Phone number is required for the primary passenger';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof PassengerDetails, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[currentPassenger] = {
      ...updatedPassengers[currentPassenger],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  const handleSpecialRequest = (request: string) => {
    const updatedPassengers = [...passengers];
    const currentRequests = updatedPassengers[currentPassenger].specialRequests || [];
    
    if (currentRequests.includes(request)) {
      updatedPassengers[currentPassenger].specialRequests = currentRequests.filter(r => r !== request);
    } else {
      updatedPassengers[currentPassenger].specialRequests = [...currentRequests, request];
    }
    
    setPassengers(updatedPassengers);
  };

  const handleContinue = () => {
    if (validatePassenger(passengers[currentPassenger])) {
      if (currentPassenger < totalPassengers - 1) {
        // Add a new passenger if needed
        if (!passengers[currentPassenger + 1]) {
          setPassengers([...passengers, {
            type: 'adult',
            title: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            nationality: '',
            passportNumber: '',
            passportExpiry: '',
            specialRequests: []
          }]);
        }
        setCurrentPassenger(currentPassenger + 1);
        setValidationErrors({});
      } else {
        onContinue(passengers);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-lg md:text-xl font-semibold">Passenger Information</h2>
        <div className="text-xs md:text-sm text-gray-600 mt-1">
          Please enter the details exactly as they appear on your travel document
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1.5 md:gap-2">
          {Array.from({ length: totalPassengers }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1.5 md:h-2 rounded-full ${
                index <= currentPassenger ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-xs md:text-sm text-gray-600 mt-1.5 md:mt-2">
          Passenger {currentPassenger + 1} of {totalPassengers}
        </div>
      </div>

      {/* Passenger Form */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Title
            </label>
            <select
              value={passengers[currentPassenger].title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                validationErrors.title ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select title</option>
              {titles.map((title) => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            {validationErrors.title && (
              <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span>{validationErrors.title}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              First Name
            </label>
            <input
              type="text"
              value={passengers[currentPassenger].firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                validationErrors.firstName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {validationErrors.firstName && (
              <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span>{validationErrors.firstName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={passengers[currentPassenger].lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                validationErrors.lastName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {validationErrors.lastName && (
              <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span>{validationErrors.lastName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Travel Document Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={passengers[currentPassenger].dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {validationErrors.dateOfBirth && (
              <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span>{validationErrors.dateOfBirth}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Nationality
            </label>
            <input
              type="text"
              value={passengers[currentPassenger].nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                validationErrors.nationality ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {validationErrors.nationality && (
              <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span>{validationErrors.nationality}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Passport Number
            </label>
            <input
              type="text"
              value={passengers[currentPassenger].passportNumber}
              onChange={(e) => handleInputChange('passportNumber', e.target.value)}
              className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                validationErrors.passportNumber ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {validationErrors.passportNumber && (
              <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span>{validationErrors.passportNumber}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Passport Expiry Date
            </label>
            <input
              type="date"
              value={passengers[currentPassenger].passportExpiry}
              onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
              className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                validationErrors.passportExpiry ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {validationErrors.passportExpiry && (
              <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span>{validationErrors.passportExpiry}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information (only for primary passenger) */}
        {currentPassenger === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={passengers[currentPassenger].email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {validationErrors.email && (
                <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{validationErrors.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={passengers[currentPassenger].phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  validationErrors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {validationErrors.phone && (
                <div className="mt-1 text-xs md:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{validationErrors.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Requests */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
            Special Requests (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {specialRequests.map((request) => (
              <button
                key={request}
                onClick={() => handleSpecialRequest(request)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition-colors ${
                  passengers[currentPassenger].specialRequests?.includes(request)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {request}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <button
            onClick={onBack}
            className="px-4 md:px-6 py-2 text-sm md:text-base text-gray-600 hover:text-gray-800 transition-colors order-2 md:order-1"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-2 text-sm md:text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity order-1 md:order-2"
          >
            <span>
              {currentPassenger < totalPassengers - 1
                ? 'Next Passenger'
                : 'Continue to Payment'}
            </span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerInfo;