import React from 'react';
import { Sparkles, Compass, Heart, Calendar, Globe, Users } from 'lucide-react';
import type { UserPreferences } from './OnboardingFlow';

interface WelcomeDashboardProps {
  preferences: UserPreferences;
  onExplore: () => void;
}

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({
  preferences,
  onExplore
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Welcome to Your Travel Journey</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Based on your preferences, we've curated unique experiences just for you.
            Let's start exploring your next adventure!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Travel Style</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.travelStyle.map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
              {preferences.interests.length > 3 && (
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                  +{preferences.interests.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Travel Duration</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.travelDuration.map((duration) => (
                <span
                  key={duration}
                  className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                >
                  {duration}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Suggested Destinations</h3>
            <div className="space-y-4">
              {['Paris, France', 'Kyoto, Japan', 'Bali, Indonesia'].map((destination) => (
                <button
                  key={destination}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    <span className="text-gray-600 group-hover:text-orange-600">{destination}</span>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-orange-500">Explore →</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Connect with Travelers</h3>
            <div className="space-y-4">
              {[
                'Adventure Seekers Group',
                'Cultural Explorers Community',
                'Sustainable Travel Network'
              ].map((group) => (
                <button
                  key={group}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    <span className="text-gray-600 group-hover:text-orange-600">{group}</span>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-orange-500">Join →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Exploring Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Compass className="w-5 h-5" />
            <span>Start Exploring</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;