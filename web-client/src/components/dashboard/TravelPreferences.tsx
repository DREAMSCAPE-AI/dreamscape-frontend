import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Edit2, Save, X, DollarSign, Globe, Plane, Bell, Armchair, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/services/dashboard';

interface TravelPreferencesProps {
  profile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const TravelPreferences: React.FC<TravelPreferencesProps> = ({ profile, onUpdateProfile }) => {
  const { t } = useTranslation('dashboard');
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
      await onUpdateProfile({ ...profile, preferences: editedPreferences });
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

  const prefItems = [
    { icon: DollarSign, label: t('travelPreferences.currency'), value: preferences.preferredCurrency, editKey: 'preferredCurrency',
      options: [{ v: 'USD', l: 'USD' }, { v: 'EUR', l: 'EUR' }, { v: 'GBP', l: 'GBP' }, { v: 'JPY', l: 'JPY' }, { v: 'CAD', l: 'CAD' }] },
    { icon: Globe, label: t('travelPreferences.language'),
      value: preferences.preferredLanguage === 'en' ? 'English' : preferences.preferredLanguage === 'fr' ? 'Français' : preferences.preferredLanguage === 'es' ? 'Español' : preferences.preferredLanguage === 'de' ? 'Deutsch' : preferences.preferredLanguage?.toUpperCase() || 'English',
      editKey: 'preferredLanguage',
      options: [{ v: 'en', l: 'English' }, { v: 'fr', l: 'Français' }, { v: 'es', l: 'Español' }, { v: 'de', l: 'Deutsch' }, { v: 'ja', l: '日本語' }] },
    { icon: Plane, label: t('travelPreferences.travelClass'), value: preferences.travelClass, editKey: 'travelClass',
      options: [{ v: 'economy', l: 'Economy' }, { v: 'business', l: 'Business' }, { v: 'first', l: 'First' }] },
    { icon: Armchair, label: t('travelPreferences.seat'), value: preferences.seatPreference, editKey: 'seatPreference',
      options: [{ v: 'window', l: 'Window' }, { v: 'aisle', l: 'Aisle' }, { v: 'middle', l: 'Middle' }] },
    { icon: Wallet, label: t('travelPreferences.travelStyle'), value: preferences.travelStyle, editKey: 'travelStyle',
      options: [{ v: 'budget', l: 'Budget' }, { v: 'mid-range', l: 'Mid-range' }, { v: 'luxury', l: 'Luxury' }] },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold tracking-tight text-surface-900">{t('travelPreferences.title')}</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
            aria-label={t('travelPreferences.edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-colors" aria-label={t('travelPreferences.cancel')}>
              <X className="w-4 h-4" />
            </button>
            <button onClick={handleSave} disabled={isSaving} className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-50" aria-label={t('travelPreferences.save')}>
              <Save className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="space-y-2.5">
        {prefItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-2 py-1">
            <div className="flex items-center gap-2 min-w-0">
              <item.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500 truncate">{item.label}</span>
            </div>
            {isEditing ? (
              <select
                value={(editedPreferences as any)[item.editKey]}
                onChange={(e) => setEditedPreferences(prev => ({ ...prev, [item.editKey]: e.target.value }))}
                className="px-2 py-1 min-h-[36px] text-xs font-medium bg-surface-100 border border-surface-200/50 rounded-lg focus:ring-2 focus:ring-orange-500/50"
                aria-label={item.label}
              >
                {item.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
              </select>
            ) : (
              <span className="text-sm font-medium text-surface-900 capitalize flex-shrink-0">{item.value}</span>
            )}
          </div>
        ))}

        {/* Budget range */}
        <div className="flex items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm text-gray-500">{t('travelPreferences.budgetRange')}</span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input type="number" value={editedPreferences.budgetRange.min}
                onChange={(e) => setEditedPreferences(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, min: parseInt(e.target.value) || 0 } }))}
                className="w-16 px-2 py-1 min-h-[36px] text-xs bg-surface-100 border border-surface-200/50 rounded-lg focus:ring-2 focus:ring-orange-500/50"
                aria-label={t('travelPreferences.budgetMin')} />
              <span className="text-xs text-gray-300">—</span>
              <input type="number" value={editedPreferences.budgetRange.max}
                onChange={(e) => setEditedPreferences(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, max: parseInt(e.target.value) || 0 } }))}
                className="w-16 px-2 py-1 min-h-[36px] text-xs bg-surface-100 border border-surface-200/50 rounded-lg focus:ring-2 focus:ring-orange-500/50"
                aria-label={t('travelPreferences.budgetMax')} />
            </div>
          ) : (
            <span className="text-sm font-medium text-surface-900">
              ${preferences.budgetRange?.min || 0} — ${preferences.budgetRange?.max || 5000}
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-4 pt-4 border-t border-surface-200/50">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold tracking-[0.08em] uppercase text-gray-400">{t('travelPreferences.notifications')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(preferences.notifications || {}).map(([key, value]) => (
            isEditing ? (
              <label key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 rounded-lg cursor-pointer hover:bg-surface-100 transition-colors">
                <input type="checkbox"
                  checked={editedPreferences.notifications?.[key as keyof typeof editedPreferences.notifications]}
                  onChange={(e) => setEditedPreferences(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: e.target.checked } }))}
                  className="w-3.5 h-3.5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                  aria-label={`${t('travelPreferences.toggle')} ${key}`} />
                <span className="text-xs text-gray-600 capitalize">{key}</span>
              </label>
            ) : (
              <span key={key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${value ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-100 text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="capitalize">{key}</span>
              </span>
            )
          ))}
        </div>
      </div>

      {/* Save button when editing */}
      {isEditing && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 w-full py-2.5 text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-shadow"
          aria-label={isSaving ? t('travelPreferences.saving') : t('travelPreferences.saveChanges')}
        >
          {isSaving ? t('travelPreferences.saving') : t('travelPreferences.saveChanges')}
        </motion.button>
      )}
    </div>
  );
};

export default TravelPreferences;
