import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, Check, AlertCircle } from 'lucide-react';
import GdprService, { PrivacyPolicy as PrivacyPolicyType } from '@/services/user/GdprService';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('gdpr');
  const [policy, setPolicy] = useState<PrivacyPolicyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadPolicy();
    checkAcceptanceStatus();
  }, []);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const response = await GdprService.getCurrentPolicy();
      if (response.success && response.data) {
        setPolicy(response.data);
      } else {
        setError(t('privacy.errorDescription'));
      }
    } catch (err) {
      console.error('[PrivacyPolicy] Failed to load policy:', err);
      setError(t('privacy.error'));
    } finally {
      setLoading(false);
    }
  };

  const checkAcceptanceStatus = async () => {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const authData = JSON.parse(authStorage);
      const token = authData?.state?.token;

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      // Try to get consent to check if user has accepted the policy
      try {
        const consentResponse = await GdprService.getConsent();
        // If we get consent, user has accepted a policy version
        setHasAccepted(!!consentResponse.data);
      } catch (err: any) {
        // If 401 or any error, assume not accepted
        if (err?.response?.status === 401) {
          setIsLoggedIn(false);
        }
        setHasAccepted(false);
      }
    } catch (err) {
      console.error('[PrivacyPolicy] Failed to check auth status:', err);
      setIsLoggedIn(false);
    }
  };

  const handleAcceptPolicy = async () => {
    if (!policy) return;

    setAccepting(true);
    try {
      const response = await GdprService.acceptPolicy(policy.id);
      if (response.success) {
        setHasAccepted(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('[PrivacyPolicy] Failed to accept policy:', err);
      alert(t('privacy.error'));
    } finally {
      setAccepting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('privacy.loading')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !policy) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">{t('privacy.title')}</h1>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-semibold">{t('privacy.error')}</h2>
              </div>
              <p className="text-gray-600">{error || t('privacy.errorDescription')}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold">{t('privacy.title')}</h1>
            </div>
          </div>

          {/* Success Toast */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                {t('privacy.accept.success')}
              </span>
            </div>
          )}

          {/* Policy Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-pink-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{policy.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                  Version {policy.version}
                </span>
                <span className="text-gray-600">
                  {t('privacy.effectiveDate')}: {formatDate(policy.effectiveAt)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div
                className="prose prose-gray max-w-none"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#374151',
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: policy.content }}
                  style={{
                    whiteSpace: 'pre-wrap',
                  }}
                />
              </div>
            </div>

            {/* Accept Button Section */}
            {isLoggedIn && !hasAccepted && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('privacy.accept.title')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('privacy.accept.description')}
                    </p>
                  </div>
                  <button
                    onClick={handleAcceptPolicy}
                    disabled={accepting}
                    className="ml-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {accepting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t('privacy.accept.accepting')}
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {t('privacy.accept.button')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Already Accepted Message */}
            {isLoggedIn && hasAccepted && (
              <div className="border-t border-gray-200 p-6 bg-green-50">
                <div className="flex items-center gap-3 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">
                    {t('privacy.accept.accepted')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              {t('privacy.lastUpdated')}: {formatDate(policy.createdAt)}
            </p>
            <p className="mt-2">
              {t('privacy.contactText')}{' '}
              <a href="mailto:privacy@dreamscape.com" className="text-orange-500 hover:text-orange-600 font-medium">
                privacy@dreamscape.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
