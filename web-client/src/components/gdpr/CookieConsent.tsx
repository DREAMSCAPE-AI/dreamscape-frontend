import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, Settings, X, Shield, Check } from 'lucide-react';
import GdprService from '@/services/api/GdprService';

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  preferences: boolean;
  timestamp: number;
}

const CookieConsent: React.FC = () => {
  const { t } = useTranslation('gdpr');
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay for smooth animation
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const saveConsent = async (consentData: Omit<CookiePreferences, 'timestamp'>) => {
    setIsLoading(true);

    try {
      // Save to localStorage
      const consentToSave: CookiePreferences = {
        ...consentData,
        timestamp: Date.now(),
      };
      localStorage.setItem('cookie-consent', JSON.stringify(consentToSave));

      // If user is logged in, also save to backend
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          const token = authData?.state?.token;

          if (token) {
            await GdprService.updateConsent({
              analytics: consentData.analytics,
              marketing: consentData.marketing,
              preferences: consentData.preferences,
            });
          }
        } catch (error) {
          console.error('[CookieConsent] Failed to sync consent with backend:', error);
        }
      }

      // Hide banner with animation
      setIsVisible(false);
    } catch (error) {
      console.error('[CookieConsent] Failed to save consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      analytics: true,
      marketing: true,
      functional: true,
      preferences: true,
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      analytics: false,
      marketing: false,
      functional: true, // Always true
      preferences: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent({
      analytics,
      marketing,
      functional: true, // Always true
      preferences,
    });
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleCloseCustomize = () => {
    setShowCustomize(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!showCustomize ? (
            // Main banner
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t('cookie.title')}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('cookie.description')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                <button
                  onClick={handleRejectAll}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('cookie.rejectAll')}
                </button>
                <button
                  onClick={handleCustomize}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Settings className="w-4 h-4" />
                  {t('cookie.customize')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('cookie.saving') : t('cookie.acceptAll')}
                </button>
              </div>
            </div>
          ) : (
            // Customize view
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('cookie.preferences.title')}
                  </h3>
                </div>
                <button
                  onClick={handleCloseCustomize}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {/* Functional cookies - always enabled */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900">{t('cookie.preferences.functional.title')}</h4>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{t('cookie.preferences.functional.required')}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('cookie.preferences.functional.description')}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <div className="w-11 h-6 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-75">
                      <div className="w-4 h-4 bg-white rounded-full shadow flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{t('cookie.preferences.analytics.title')}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('cookie.preferences.analytics.description')}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <button
                      onClick={() => setAnalytics(!analytics)}
                      className={`w-11 h-6 rounded-full transition-colors ${
                        analytics ? 'bg-orange-500' : 'bg-gray-300'
                      } flex items-center ${analytics ? 'justify-end' : 'justify-start'} px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </button>
                  </div>
                </div>

                {/* Marketing cookies */}
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{t('cookie.preferences.marketing.title')}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('cookie.preferences.marketing.description')}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <button
                      onClick={() => setMarketing(!marketing)}
                      className={`w-11 h-6 rounded-full transition-colors ${
                        marketing ? 'bg-orange-500' : 'bg-gray-300'
                      } flex items-center ${marketing ? 'justify-end' : 'justify-start'} px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </button>
                  </div>
                </div>

                {/* Preferences cookies */}
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{t('cookie.preferences.preference.title')}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('cookie.preferences.preference.description')}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <button
                      onClick={() => setPreferences(!preferences)}
                      className={`w-11 h-6 rounded-full transition-colors ${
                        preferences ? 'bg-orange-500' : 'bg-gray-300'
                      } flex items-center ${preferences ? 'justify-end' : 'justify-start'} px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleCloseCustomize}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('cookie.preferences.cancel')}
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('cookie.saving') : t('cookie.preferences.save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
