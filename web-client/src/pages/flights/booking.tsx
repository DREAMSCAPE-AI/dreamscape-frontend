/**
 * Flight Booking Multi-Step Wizard
 * 7 Steps: Search → Select Flight → Choose Seats → Select Meals → Add Baggage → Passenger Info → Payment
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useFlightBookingStore, FlightBookingStep } from '@/store/flightBookingStore';
import FlightSeatSelection from '@/components/flights/booking/FlightSeatSelection';
import FlightMealSelection from '@/components/flights/booking/FlightMealSelection';
import FlightBaggageSelection from '@/components/flights/booking/FlightBaggageSelection';
import FlightPassengerInfo from '@/components/flights/booking/FlightPassengerInfo';
import FlightPayment from '@/components/flights/booking/FlightPayment';

const STEP_TITLES = {
  [FlightBookingStep.SEARCH]: 'Search Flights',
  [FlightBookingStep.SELECT_FLIGHT]: 'Select Flight',
  [FlightBookingStep.CHOOSE_SEATS]: 'Choose Seats',
  [FlightBookingStep.SELECT_MEALS]: 'Select Meals',
  [FlightBookingStep.ADD_BAGGAGE]: 'Add Baggage',
  [FlightBookingStep.PASSENGER_INFO]: 'Passenger Information',
  [FlightBookingStep.PAYMENT]: 'Payment',
};

export default function FlightBookingPage() {
  const navigate = useNavigate();
  const {
    currentStep,
    selectedFlight,
    nextStep,
    previousStep,
    canProceedToNextStep,
    error,
    clearError,
    getTotalPrice,
    currency,
  } = useFlightBookingStore();

  // Redirect to search if no flight selected
  useEffect(() => {
    if (!selectedFlight && currentStep !== FlightBookingStep.SEARCH) {
      navigate('/flights');
    }
  }, [selectedFlight, currentStep, navigate]);

  if (!selectedFlight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Flight Selected</h2>
          <p className="text-gray-600 mb-6">Please search and select a flight first.</p>
          <button
            onClick={() => navigate('/flights')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (canProceedToNextStep()) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleBackToSearch = () => {
    navigate('/flights');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Flight Search
          </button>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {Object.entries(STEP_TITLES).map(([stepNum, title], index) => {
              const step = parseInt(stepNum) as FlightBookingStep;
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              const isAccessible = step <= FlightBookingStep.SELECT_FLIGHT || currentStep >= step;

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-orange-500 text-white'
                          : isAccessible
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center ${
                        isActive ? 'text-orange-600' : 'text-gray-600'
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                  {index < Object.keys(STEP_TITLES).length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={clearError} className="text-red-700 hover:text-red-900">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Step Content */}
            <div className="p-6 min-h-[500px]">
              {currentStep === FlightBookingStep.CHOOSE_SEATS && <FlightSeatSelection />}
              {currentStep === FlightBookingStep.SELECT_MEALS && <FlightMealSelection />}
              {currentStep === FlightBookingStep.ADD_BAGGAGE && <FlightBaggageSelection />}
              {currentStep === FlightBookingStep.PASSENGER_INFO && <FlightPassengerInfo />}
              {currentStep === FlightBookingStep.PAYMENT && <FlightPayment />}
            </div>

            {/* Navigation Footer */}
            {currentStep !== FlightBookingStep.PAYMENT && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Price Summary */}
                  <div>
                    <div className="text-sm text-gray-600">Total Price</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {currency} {getTotalPrice().toFixed(2)}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    {currentStep > FlightBookingStep.SELECT_FLIGHT && (
                      <button
                        onClick={handlePrevious}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                      >
                        Previous
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!canProceedToNextStep()}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        canProceedToNextStep()
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {currentStep === FlightBookingStep.PASSENGER_INFO ? 'Continue to Payment' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
