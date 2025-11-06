import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Globe, Calendar, DollarSign, Users, ArrowRight, Check } from 'lucide-react';

export interface UserPreferences {
  travelStyle: string[];
  interests: string[];
  budget: {
    currency: string;
    range: [number, number];
  };
  travelDuration: string[];
  accessibility: string[];
  sustainability: boolean;
}

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    travelStyle: [],
    interests: [],
    budget: {
      currency: 'USD',
      range: [0, 5000]
    },
    travelDuration: [],
    accessibility: [],
    sustainability: false
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-full mb-8">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome to DreamScape</h2>
                <p className="text-gray-600">Let's personalize your travel experience</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's your travel style?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Adventure Seeker',
                    'Culture Explorer',
                    'Luxury Traveler',
                    'Budget Backpacker',
                    'Family Travel',
                    'Digital Nomad'
                  ].map((style) => (
                    <button
                      key={style}
                      onClick={() => setPreferences(prev => ({
                        ...prev,
                        travelStyle: prev.travelStyle.includes(style)
                          ? prev.travelStyle.filter(s => s !== style)
                          : [...prev.travelStyle, style]
                      }))}
                      className={`p-4 rounded-xl text-left transition-colors ${
                        preferences.travelStyle.includes(style)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Your Interests</h2>
                <p className="text-gray-600">Select what interests you most</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  'Food & Dining',
                  'Art & Museums',
                  'Nature & Outdoors',
                  'History & Culture',
                  'Shopping',
                  'Nightlife',
                  'Wellness & Spa',
                  'Photography',
                  'Local Experiences'
                ].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => setPreferences(prev => ({
                      ...prev,
                      interests: prev.interests.includes(interest)
                        ? prev.interests.filter(i => i !== interest)
                        : [...prev.interests, interest]
                    }))}
                    className={`p-4 rounded-xl flex items-center justify-center text-center transition-colors ${
                      preferences.interests.includes(interest)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Travel Budget</h2>
                <p className="text-gray-600">What's your typical budget range?</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={preferences.budget.currency}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      budget: { ...prev.budget, currency: e.target.value }
                    }))}
                    className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    {['USD', 'EUR', 'GBP', 'JPY'].map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range (per person)
                  </label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={preferences.budget.range[1]}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        budget: {
                          ...prev.budget,
                          range: [prev.budget.range[0], parseInt(e.target.value)]
                        }
                      }))}
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{preferences.budget.currency} 0</span>
                      <span>{preferences.budget.currency} {preferences.budget.range[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Travel Duration</h2>
                <p className="text-gray-600">How long do you typically travel?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  'Weekend Trips',
                  'Short Breaks (3-5 days)',
                  'Week-long Trips',
                  'Extended Stays (2+ weeks)',
                  'Month-long Adventures',
                  'Digital Nomad Life'
                ].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setPreferences(prev => ({
                      ...prev,
                      travelDuration: prev.travelDuration.includes(duration)
                        ? prev.travelDuration.filter(d => d !== duration)
                        : [...prev.travelDuration, duration]
                    }))}
                    className={`p-4 rounded-xl text-left transition-colors ${
                      preferences.travelDuration.includes(duration)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Additional Preferences</h2>
                <p className="text-gray-600">Help us make your experience better</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Accessibility Needs</h3>
                  <div className="space-y-3">
                    {[
                      'Wheelchair Accessible',
                      'Limited Mobility',
                      'Hearing Impaired',
                      'Visually Impaired',
                      'Sensory Friendly'
                    ].map((need) => (
                      <label key={need} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.accessibility.includes(need)}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            accessibility: e.target.checked
                              ? [...prev.accessibility, need]
                              : prev.accessibility.filter(a => a !== need)
                          }))}
                          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">{need}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.sustainability}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        sustainability: e.target.checked
                      }))}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">
                      Prioritize eco-friendly and sustainable travel options
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <button
            onClick={() => setStep(step - 1)}
            className={`px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors ${
              step === 1 ? 'invisible' : ''
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <span>{step === totalSteps ? 'Complete Setup' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;