import React, { useState, useEffect, useRef } from 'react';
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
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { ProfileService, UserProfile } from '../../services/profile/ProfileService';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock user ID - in real app, this would come from auth context
  const userId = "user-123";

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    preferences: {
      notifications: true,
      newsletter: true,
      twoFactor: false,
      language: 'French',
      currency: 'EUR',
      travelStyle: ['Cultural', 'Adventure'],
      interests: ['Photography', 'Food']
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await ProfileService.getProfile(userId);
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        preferences: profileData.preferences || {
          notifications: true,
          newsletter: true,
          twoFactor: false,
          language: 'French',
          currency: 'EUR',
          travelStyle: ['Cultural', 'Adventure'],
          interests: ['Photography', 'Food']
        }
      });
    } catch (error) {
      // If profile doesn't exist, create it with mock data
      console.log('Profile not found, will create one when saving');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrors([]);
      setSuccessMessage('');

      const validationErrors = ProfileService.validateProfileData(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      let updatedProfile;
      if (profile) {
        updatedProfile = await ProfileService.updateProfile(userId, formData);
      } else {
        updatedProfile = await ProfileService.createProfile(userId, formData);
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage('Profil mis à jour avec succès !');
    } catch (error: any) {
      setErrors([error.message || 'Erreur lors de la sauvegarde']);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setErrors([]);

      const validationErrors = ProfileService.validateAvatarFile(file);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      const result = await ProfileService.uploadAvatar(userId, file);
      setProfile(result.profile);
      setSuccessMessage('Avatar mis à jour avec succès !');
    } catch (error: any) {
      setErrors([error.message || 'Erreur lors de l\'upload']);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span>Chargement du profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Erreurs de validation :</span>
            </div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-pink-500" />
          <div className="px-6 pb-6">
            <div className="relative flex items-end gap-6 -mt-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                  {profile?.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${profile.avatar}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1 flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile ? `${profile.firstName} ${profile.lastName}` : `${formData.firstName} ${formData.lastName}` || 'Nom non défini'}
                  </h1>
                  <p className="text-gray-600">Passionné de voyage</p>
                </div>
                <button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Sauvegarder</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Modifier le profil</span>
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
              <h2 className="text-xl font-semibold mb-6">Informations de base</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="bg-transparent w-full outline-none disabled:cursor-not-allowed"
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de famille</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="bg-transparent w-full outline-none disabled:cursor-not-allowed"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-transparent w-full outline-none disabled:cursor-not-allowed"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="bg-transparent w-full outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Préférences de voyage</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Style de voyage</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferences.travelStyle.map((style, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm flex items-center gap-1"
                      >
                        {style}
                        {isEditing && (
                          <button
                            onClick={() => {
                              const newStyles = formData.preferences.travelStyle.filter((_, i) => i !== index);
                              handlePreferenceChange('travelStyle', newStyles);
                            }}
                            className="hover:text-orange-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value && !formData.preferences.travelStyle.includes(e.target.value)) {
                              handlePreferenceChange('travelStyle', [...formData.preferences.travelStyle, e.target.value]);
                            }
                            e.target.value = '';
                          }}
                          className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500"
                        >
                          <option value="">+ Ajouter style</option>
                          <option value="Culturel">Culturel</option>
                          <option value="Aventure">Aventure</option>
                          <option value="Luxe">Luxe</option>
                          <option value="Détente">Détente</option>
                          <option value="Gastronomie">Gastronomie</option>
                          <option value="Nature">Nature</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Centres d'intérêt</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferences.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm flex items-center gap-1"
                      >
                        {interest}
                        {isEditing && (
                          <button
                            onClick={() => {
                              const newInterests = formData.preferences.interests.filter((_, i) => i !== index);
                              handlePreferenceChange('interests', newInterests);
                            }}
                            className="hover:text-gray-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value && !formData.preferences.interests.includes(e.target.value)) {
                              handlePreferenceChange('interests', [...formData.preferences.interests, e.target.value]);
                            }
                            e.target.value = '';
                          }}
                          className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-orange-500"
                        >
                          <option value="">+ Ajouter intérêt</option>
                          <option value="Photographie">Photographie</option>
                          <option value="Gastronomie">Gastronomie</option>
                          <option value="Histoire">Histoire</option>
                          <option value="Nature">Nature</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Art">Art</option>
                          <option value="Sport">Sport</option>
                          <option value="Musique">Musique</option>
                        </select>
                      </div>
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
              <h2 className="text-xl font-semibold mb-6">Paramètres du compte</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Languages className="w-5 h-5 text-gray-400" />
                    <select
                      value={formData.preferences.language}
                      disabled={!isEditing}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="bg-transparent w-full outline-none disabled:cursor-not-allowed"
                    >
                      <option value="French">Français</option>
                      <option value="English">English</option>
                      <option value="Spanish">Español</option>
                      <option value="German">Deutsch</option>
                      <option value="Italian">Italiano</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <select
                      value={formData.preferences.currency}
                      disabled={!isEditing}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      className="bg-transparent w-full outline-none disabled:cursor-not-allowed"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (Fr)</option>
                      <option value="CAD">CAD ($)</option>
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
                    <span className="text-gray-700">Notifications push</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications}
                    disabled={!isEditing}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 disabled:cursor-not-allowed"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Newsletter par email</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.newsletter}
                    disabled={!isEditing}
                    onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 disabled:cursor-not-allowed"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Authentification à deux facteurs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.twoFactor}
                    disabled={!isEditing}
                    onChange={(e) => handlePreferenceChange('twoFactor', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 disabled:cursor-not-allowed"
                  />
                </label>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Sécurité</h2>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Changer le mot de passe
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Appareils connectés
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Historique de connexion
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