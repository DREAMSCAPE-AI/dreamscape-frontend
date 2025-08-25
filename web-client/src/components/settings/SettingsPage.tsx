import React, { useState } from 'react';
import { 
  User,
  Settings as SettingsIcon,
  Bell,
  Lock,
  Globe,
  CreditCard,
  Languages,
  DollarSign,
  Heart,
  MapPin,
  Hotel,
  Utensils,
  Shield,
  Mail,
  Eye,
  Save
} from 'lucide-react';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
    },
    preferences: {
      language: 'English',
      currency: 'USD',
      timezone: 'America/New_York'
    },
    notifications: {
      dealAlerts: true,
      tripReminders: true,
      priceAlerts: true,
      newsletter: false
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false,
      marketing: true
    },
    travel: {
      preferredDestinations: ['Europe', 'Asia'],
      accommodationType: ['Hotel', 'Resort'],
      activities: ['Cultural', 'Adventure'],
      dietary: ['Vegetarian']
    }
  });

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'travel', label: 'Travel Preferences', icon: Globe }
  ];

  const handleSave = () => {
    // Handle saving settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          {/* Navigation */}
          <div className="flex overflow-x-auto no-scrollbar">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-600 hover:text-orange-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
                <div className="flex items-center gap-6">
                  <img
                    src={settings.profile.photo}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Change Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, name: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payment Methods</h2>
                  <button className="text-orange-500 hover:text-orange-600 transition-colors">
                    Add New
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <div className="font-medium">•••• 4242</div>
                        <div className="text-sm text-gray-500">Expires 12/24</div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              {/* Language & Region */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Language & Region</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, language: e.target.value }
                        })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="English">English</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, currency: e.target.value }
                        })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Security</h2>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">Change Password</span>
                    <Shield className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">Two-Factor Authentication</span>
                    <Lock className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {key === 'dealAlerts' && 'Get notified about special offers and deals'}
                        {key === 'tripReminders' && 'Receive important trip updates and reminders'}
                        {key === 'priceAlerts' && 'Monitor price changes for your saved trips'}
                        {key === 'newsletter' && 'Stay updated with travel tips and inspiration'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [key]: e.target.checked
                        }
                      })}
                      className="w-6 h-6 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              {/* Profile Visibility */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Profile Visibility</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Public Profile</div>
                        <div className="text-sm text-gray-500">
                          Allow others to see your travel history and reviews
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.profileVisibility === 'public'}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          profileVisibility: e.target.checked ? 'public' : 'private'
                        }
                      })}
                      className="w-6 h-6 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Data & Privacy</h2>
                <div className="space-y-4">
                  {[
                    {
                      key: 'dataSharing',
                      label: 'Data Sharing',
                      description: 'Share anonymous travel data to improve recommendations'
                    },
                    {
                      key: 'marketing',
                      label: 'Marketing Communications',
                      description: 'Receive personalized travel offers and updates'
                    }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privacy[item.key]}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            [item.key]: e.target.checked
                          }
                        })}
                        className="w-6 h-6 text-orange-500 rounded focus:ring-orange-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Travel Preferences */}
          {activeSection === 'travel' && (
            <div className="space-y-6">
              {/* Destinations */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Preferred Destinations</h2>
                <div className="flex flex-wrap gap-2">
                  {settings.travel.preferredDestinations.map((destination) => (
                    <span
                      key={destination}
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      {destination}
                    </span>
                  ))}
                  <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500 hover:text-orange-500">
                    + Add Destination
                  </button>
                </div>
              </div>

              {/* Accommodation */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Accommodation Preferences</h2>
                <div className="flex flex-wrap gap-2">
                  {settings.travel.accommodationType.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm flex items-center gap-1"
                    >
                      <Hotel className="w-4 h-4" />
                      {type}
                    </span>
                  ))}
                  <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500 hover:text-orange-500">
                    + Add Type
                  </button>
                </div>
              </div>

              {/* Activities */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Activity Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {settings.travel.activities.map((activity) => (
                    <span
                      key={activity}
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm flex items-center gap-1"
                    >
                      <Heart className="w-4 h-4" />
                      {activity}
                    </span>
                  ))}
                  <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500 hover:text-orange-500">
                    + Add Interest
                  </button>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Dietary Preferences</h2>
                <div className="flex flex-wrap gap-2">
                  {settings.travel.dietary.map((diet) => (
                    <span
                      key={diet}
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm flex items-center gap-1"
                    >
                      <Utensils className="w-4 h-4" />
                      {diet}
                    </span>
                  ))}
                  <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500 hover:text-orange-500">
                    + Add Preference
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;