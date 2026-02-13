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
import { useTranslation } from 'react-i18next';
import { profileService, UserProfileData } from '@/services/user';
import { languageNameToCode, languageCodeToName } from '@/i18n/languageMapping';
import TravelPreferencesSection from './TravelPreferencesSection';
import ConsentManager from '@/components/gdpr/ConsentManager';
import DataRightsSection from '@/components/gdpr/DataRightsSection';

const SettingsPage = () => {
  const { t, i18n } = useTranslation('settings');
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
      alert(t('profile.photo.selectImage'));
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
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'account', label: t('tabs.account'), icon: SettingsIcon },
    { id: 'notifications', label: t('tabs.notifications'), icon: Bell },
    { id: 'privacy', label: t('tabs.privacy'), icon: Lock },
    { id: 'travel', label: t('tabs.travel'), icon: Globe },
    { id: 'data-privacy', label: t('tabs.dataPrivacy'), icon: Shield }
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
          <p className="text-gray-600">{t('header.loading')}</p>
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
            <h1 className="text-2xl font-bold">{t('header.title')}</h1>
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
              {saving ? t('header.saving') : t('header.saveChanges')}
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
                <h2 className="text-lg font-semibold mb-4">{t('profile.photo.title')}</h2>
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
                      {avatarUploading ? t('profile.photo.uploading') : t('profile.photo.change')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('profile.personal.title')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.personal.fullName')}
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
                      {t('profile.personal.email')}
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
                  <h2 className="text-lg font-semibold">{t('profile.payment.title')}</h2>
                  <button className="text-orange-500 hover:text-orange-600 transition-colors">
                    {t('profile.payment.addNew')}
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <div className="font-medium">•••• 4242</div>
                        <div className="text-sm text-gray-500">{t('profile.payment.expires')} 12/24</div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {t('profile.payment.edit')}
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
                <h2 className="text-lg font-semibold mb-4">{t('account.language.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('account.language.language')}
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => {
                          const newLanguage = e.target.value;
                          setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, language: newLanguage }
                          });
                          // Also change i18n language
                          const code = languageNameToCode[newLanguage];
                          if (code) {
                            i18n.changeLanguage(code);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="English">{t('account.language.options.english')}</option>
                        <option value="French">{t('account.language.options.french')}</option>
                        <option value="Spanish">{t('account.language.options.spanish')}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('account.language.currency')}
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
                        <option value="USD">{t('account.language.currencies.usd')}</option>
                        <option value="EUR">{t('account.language.currencies.eur')}</option>
                        <option value="GBP">{t('account.language.currencies.gbp')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('account.security.title')}</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{t('account.security.changePassword')}</span>
                    <Shield className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">{t('account.security.twoFactor')}</span>
                    <Lock className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">{t('notifications.title')}</h2>
              <div className="space-y-6">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-medium">
                        {t(`notifications.${key}.label`)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t(`notifications.${key}.description`)}
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
                <h2 className="text-lg font-semibold mb-4">{t('privacy.visibility.title')}</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{t('privacy.visibility.publicProfile')}</div>
                        <div className="text-sm text-gray-500">
                          {t('privacy.visibility.publicDescription')}
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
                <h2 className="text-lg font-semibold mb-4">{t('privacy.data.title')}</h2>
                <div className="space-y-4">
                  {[
                    {
                      key: 'dataSharing',
                      label: t('privacy.data.dataSharing'),
                      description: t('privacy.data.dataSharingDescription')
                    },
                    {
                      key: 'marketing',
                      label: t('privacy.data.marketing'),
                      description: t('privacy.data.marketingDescription')
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

          {/* Data & Privacy (GDPR) */}
          {activeSection === 'data-privacy' && (
            <div className="space-y-6">
              <ConsentManager />
              <DataRightsSection />
            </div>
          )}
        </div>
      </div>

      {/* Modal pour changer le mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('account.security.changePassword')}</h3>
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
                  {t('account.security.currentPassword')}
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
                  {t('account.security.newPassword')}
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
                  {t('account.security.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-500 text-sm">{t('account.security.passwordMismatch')}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t('account.security.cancel')}
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement password change
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('account.security.changePassword')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>{t('header.saved')}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;