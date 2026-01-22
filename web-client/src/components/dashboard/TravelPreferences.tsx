import React, { useState } from 'react';
import { Settings, Edit2, Save, X, DollarSign, Globe, Plane, Bell } from 'lucide-react';
import { UserProfile } from '../../services/dashboardService';

interface TravelPreferencesProps {
  profile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const TravelPreferences: React.FC<TravelPreferencesProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState(profile?.preferences || {
    preferredCurrency: 'USD',
    preferredLanguage: 'en',
    travelClass: 'economy' as const,
    seatPreference: 'window' as const,
    mealPreference: [],
    budgetRange: { min: 0, max: 5000 },
    destinations: [],
    travelStyle: 'mid-range' as const,
    notifications: { email: true, sms: false, push: true }
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      await onUpdateProfile({
        ...profile,
        preferences: editedPreferences
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPreferences(profile?.preferences || editedPreferences);
    setIsEditing(false);
  };

  const preferences = profile?.preferences || editedPreferences;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">Travel Preferences</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Currency Preference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Currency</span>
          </div>
          {isEditing ? (
            <select
              value={editedPreferences.preferredCurrency}
              onChange={(e) => setEditedPreferences(prev => ({ ...prev, preferredCurrency: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
            </select>
          ) : (
            <span className="text-sm text-gray-600">{preferences.preferredCurrency}</span>
          )}
        </div>

        {/* Language Preference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Language</span>
          </div>
          {isEditing ? (
            <select
              value={editedPreferences.preferredLanguage}
              onChange={(e) => setEditedPreferences(prev => ({ ...prev, preferredLanguage: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          ) : (
            <span className="text-sm text-gray-600">
              {preferences.preferredLanguage === 'en' ? 'English' :
               preferences.preferredLanguage === 'es' ? 'Spanish' :
               preferences.preferredLanguage === 'fr' ? 'French' :
               preferences.preferredLanguage === 'de' ? 'German' :
               preferences.preferredLanguage === 'ja' ? 'Japanese' :
               preferences.preferredLanguage?.toUpperCase() || 'English'}
            </span>
          )}
        </div>

        {/* Travel Class */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Travel Class</span>
          </div>
          {isEditing ? (
            <select
              value={editedPreferences.travelClass}
              onChange={(e) => setEditedPreferences(prev => ({ ...prev, travelClass: e.target.value as 'economy' | 'business' | 'first' }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          ) : (
            <span className="text-sm text-gray-600 capitalize">{preferences.travelClass}</span>
          )}
        </div>

        {/* Seat Preference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Seat</span>
          </div>
          {isEditing ? (
            <select
              value={editedPreferences.seatPreference}
              onChange={(e) => setEditedPreferences(prev => ({ ...prev, seatPreference: e.target.value as 'window' | 'aisle' | 'middle' }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="window">Window</option>
              <option value="aisle">Aisle</option>
              <option value="middle">Middle</option>
            </select>
          ) : (
            <span className="text-sm text-gray-600 capitalize">{preferences.seatPreference}</span>
          )}
        </div>

        {/* Budget Range */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Budget Range</span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editedPreferences.budgetRange.min}
                onChange={(e) => setEditedPreferences(prev => ({ 
                  ...prev, 
                  budgetRange: { ...prev.budgetRange, min: parseInt(e.target.value) || 0 }
                }))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Min"
              />
              <span className="text-xs text-gray-500">-</span>
              <input
                type="number"
                value={editedPreferences.budgetRange.max}
                onChange={(e) => setEditedPreferences(prev => ({ 
                  ...prev, 
                  budgetRange: { ...prev.budgetRange, max: parseInt(e.target.value) || 0 }
                }))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Max"
              />
            </div>
          ) : (
            <span className="text-sm text-gray-600">
              ${preferences.budgetRange?.min || 0} - ${preferences.budgetRange?.max || 5000}
            </span>
          )}
        </div>

        {/* Travel Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Travel Style</span>
          </div>
          {isEditing ? (
            <select
              value={editedPreferences.travelStyle}
              onChange={(e) => setEditedPreferences(prev => ({ ...prev, travelStyle: e.target.value as 'luxury' | 'budget' | 'mid-range' }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          ) : (
            <span className="text-sm text-gray-600 capitalize">{preferences.travelStyle}</span>
          )}
        </div>

        {/* Notifications */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Notifications</span>
          </div>
          <div className="space-y-2 ml-6">
            {Object.entries(preferences.notifications || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{key}</span>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={editedPreferences.notifications?.[key as keyof typeof editedPreferences.notifications]}
                    onChange={(e) => setEditedPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [key]: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                ) : (
                  <div className={`w-4 h-4 rounded ${value ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPreferences;