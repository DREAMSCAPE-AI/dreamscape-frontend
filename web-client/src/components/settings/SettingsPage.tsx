import React, { useState, useEffect, useRef } from 'react';
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
  Save,
  Plus,
  X,
  Upload
} from 'lucide-react';
import { profileService, UserProfileData } from '@/services/profile';
import TravelPreferencesSection from './TravelPreferencesSection';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<UserProfileData>({
    profile: {
      name: '',
      email: '',
      photo: null
    },
    preferences: {
      language: 'English',
      currency: 'USD',
      timezone: 'UTC'
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
  });

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await profileService.getProfile();
        setSettings(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);


  // Fonction pour redimensionner l'image
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const MAX_SIZE = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Fonction pour changer l'avatar
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setAvatarUploading(true);
    try {
      const resizedImage = await resizeImage(file);
      
      // Upload the image to the server and store the returned URL/ID in settings
      const uploadedPhotoUrl = await profileService.uploadPhoto(resizedImage);
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          photo: uploadedPhotoUrl
        }
      }));
      
    } catch (error) {
      console.error('Erreur lors du redimensionnement:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'travel', label: 'Travel Preferences', icon: Globe }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = await profileService.updateProfile(settings);
      // Update the local state with the response from the server
      if (updatedData.profile || updatedData.preferences || updatedData.notifications || updatedData.privacy) {
        setSettings({
          profile: updatedData.profile || settings.profile,
          preferences: updatedData.preferences || settings.preferences,
          notifications: updatedData.notifications || settings.notifications,
          privacy: updatedData.privacy || settings.privacy
        });
      }
      
      // Afficher le toast de succès
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      // You could add an error toast/notification here
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
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
                    src={settings.profile.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {avatarUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {avatarUploading ? 'Uploading...' : 'Change Photo'}
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
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
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
            <TravelPreferencesSection />
          )}
        </div>
      </div>

      {/* Modal pour ajouter un item */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Add {modalType === 'destinations' ? 'Destination' : 
                     modalType === 'accommodation' ? 'Accommodation Type' :
                     modalType === 'activities' ? 'Activity Interest' :
                     'Dietary Preference'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`Enter ${modalType === 'destinations' ? 'destination' :
                                    modalType === 'accommodation' ? 'accommodation type' :
                                    modalType === 'activities' ? 'activity' :
                                    'dietary preference'}...`}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={addItem}
                  disabled={!newItem.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour changer le mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-500 text-sm">Passwords do not match</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implémenter le changement de mot de passe
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>Profile saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;