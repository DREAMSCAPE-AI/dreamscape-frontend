import React, { useState } from 'react';
import { Crown, Heart, Star, Coffee, Plane, Hotel, Car, Utensils, Save } from 'lucide-react';

interface PreferenceProfileProps {
  preferences: TravelPreferences;
  onUpdate: (preferences: TravelPreferences) => void;
}

interface TravelPreferences {
  accommodationPreferences: string[];
  diningPreferences: string[];
  transportPreferences: string[];
  activities: string[];
  specialRequests: string[];
  travelHistory: TravelHistory[];
}

interface TravelHistory {
  destination: string;
  date: string;
  type: string;
  rating: number;
  notes: string;
}

const PreferenceProfile: React.FC<PreferenceProfileProps> = ({
  preferences,
  onUpdate
}) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedPreferences, setUpdatedPreferences] = useState(preferences);

  const preferenceCategories = {
    accommodation: [
      'Luxury Suite', 'Ocean View', 'High Floor', 'Private Pool',
      'Butler Service', 'Spa Access', 'Club Lounge', 'Villa'
    ],
    dining: [
      'Fine Dining', 'Michelin Star', 'Wine Pairing', 'Private Chef',
      'Dietary Restrictions', 'Local Cuisine', 'Vegetarian', 'Vegan'
    ],
    transport: [
      'Private Car', 'Luxury Vehicle', 'Chauffeur', 'Helicopter',
      'First Class', 'Business Class', 'Private Jet', 'Yacht'
    ]
  };

  const handlePreferenceToggle = (category: keyof typeof preferenceCategories, item: string) => {
    const categoryMap = {
      accommodation: 'accommodationPreferences',
      dining: 'diningPreferences',
      transport: 'transportPreferences'
    };

    const preferencesKey = categoryMap[category];
    const currentPreferences = updatedPreferences[preferencesKey];
    
    setUpdatedPreferences({
      ...updatedPreferences,
      [preferencesKey]: currentPreferences.includes(item)
        ? currentPreferences.filter(p => p !== item)
        : [...currentPreferences, item]
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Premium Travel Profile</h2>
              <p className="text-white/80">Personalized preferences for a luxurious experience</p>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            {editMode ? 'Cancel' : 'Edit Preferences'}
          </button>
        </div>
      </div>

      {/* Preferences Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accommodation Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hotel className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Accommodation</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferenceCategories.accommodation.map((item) => (
              <button
                key={item}
                onClick={() => editMode && handlePreferenceToggle('accommodation', item)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  updatedPreferences.accommodationPreferences.includes(item)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!editMode && 'cursor-default'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Dining Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Dining</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferenceCategories.dining.map((item) => (
              <button
                key={item}
                onClick={() => editMode && handlePreferenceToggle('dining', item)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  updatedPreferences.diningPreferences.includes(item)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!editMode && 'cursor-default'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Transport Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Transport</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferenceCategories.transport.map((item) => (
              <button
                key={item}
                onClick={() => editMode && handlePreferenceToggle('transport', item)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  updatedPreferences.transportPreferences.includes(item)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!editMode && 'cursor-default'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Travel History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Travel History</h3>
          </div>
          
          <div className="space-y-4">
            {updatedPreferences.travelHistory.map((trip, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{trip.destination}</div>
                  <div className="text-sm text-gray-600">{trip.date}</div>
                  <div className="text-sm text-gray-500">{trip.type}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">{trip.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Special Requests</h3>
        </div>
        
        {editMode ? (
          <textarea
            value={updatedPreferences.specialRequests.join('\n')}
            onChange={(e) => setUpdatedPreferences({
              ...updatedPreferences,
              specialRequests: e.target.value.split('\n')
            })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            rows={4}
            placeholder="Enter your special requests..."
          />
        ) : (
          <div className="space-y-2">
            {updatedPreferences.specialRequests.map((request, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg text-gray-600">
                {request}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      {editMode && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              onUpdate(updatedPreferences);
              setEditMode(false);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default PreferenceProfile;