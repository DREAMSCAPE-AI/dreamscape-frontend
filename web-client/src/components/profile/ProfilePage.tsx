import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Camera, 
  Edit2, 
  Shield,
  Languages,
  CreditCard,
  Bell,
  Key,
  Save
} from 'lucide-react';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    language: 'English',
    currency: 'USD',
    bio: 'Passionate traveler exploring the world one destination at a time. Love experiencing new cultures and creating unforgettable memories.',
    preferences: {
      notifications: true,
      newsletter: true,
      twoFactor: false
    },
    travelStyle: ['Cultural', 'Adventure', 'Luxury'],
    interests: ['Photography', 'Food', 'History', 'Nature']
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-pink-500" />
          <div className="px-6 pb-6">
            <div className="relative flex items-end gap-6 -mt-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  <p className="text-gray-600">Travel Enthusiast</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.name}
                        disabled={!isEditing}
                        className="bg-transparent w-full outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        disabled={!isEditing}
                        className="bg-transparent w-full outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        disabled={!isEditing}
                        className="bg-transparent w-full outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.location}
                        disabled={!isEditing}
                        className="bg-transparent w-full outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profileData.bio}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-3 bg-gray-50 rounded-lg outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Travel Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.travelStyle.map((style, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                    {isEditing && (
                      <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500 hover:text-orange-500">
                        + Add Style
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                    {isEditing && (
                      <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500 hover:text-orange-500">
                        + Add Interest
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings & Preferences */}
          <div className="space-y-8">
            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Languages className="w-5 h-5 text-gray-400" />
                    <select
                      value={profileData.language}
                      disabled={!isEditing}
                      className="bg-transparent w-full outline-none"
                    >
                      <option value="English">English</option>
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <select
                      value={profileData.currency}
                      disabled={!isEditing}
                      className="bg-transparent w-full outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Push Notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications}
                    disabled={!isEditing}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Email Newsletter</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.newsletter}
                    disabled={!isEditing}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Two-Factor Auth</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.twoFactor}
                    disabled={!isEditing}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </label>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Security</h2>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Change Password
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Connected Devices
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Login History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;