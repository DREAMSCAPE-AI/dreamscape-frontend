import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Check, AlertCircle, Clock } from 'lucide-react';
import GdprService, { UserConsent, ConsentHistory } from '@/services/user/GdprService';

const ConsentManager: React.FC = () => {
  const { t } = useTranslation('gdpr');
  const [consent, setConsent] = useState<UserConsent | null>(null);
  const [history, setHistory] = useState<ConsentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConsentData();
  }, []);

  const loadConsentData = async () => {
    try {
      setLoading(true);
      const [consentResponse, historyResponse] = await Promise.all([
        GdprService.getConsent(),
        GdprService.getConsentHistory(),
      ]);

      if (consentResponse.success && consentResponse.data) {
        setConsent(consentResponse.data);
      }

      if (historyResponse.success && historyResponse.data) {
        setHistory(historyResponse.data);
      }
    } catch (err) {
      console.error('[ConsentManager] Failed to load consent data:', err);
      showMessage('error', t('consent.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleToggle = async (field: 'analytics' | 'marketing' | 'preferences', value: boolean) => {
    if (!consent) return;

    setUpdating(true);
    try {
      const response = await GdprService.updateConsent({ [field]: value });

      if (response.success && response.data) {
        setConsent(response.data);
        showMessage('success', response.message || t('consent.updateSuccess'));

        // Reload history to show the new change
        const historyResponse = await GdprService.getConsentHistory();
        if (historyResponse.success && historyResponse.data) {
          setHistory(historyResponse.data);
        }
      }
    } catch (err: any) {
      console.error('[ConsentManager] Failed to update consent:', err);
      showMessage('error', err?.response?.data?.message || t('consent.updateError'));
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangedFields = (historyItem: ConsentHistory, prevItem?: ConsentHistory) => {
    if (!prevItem) return [t('consent.history.initial')];

    const changes: string[] = [];
    if (historyItem.analytics !== prevItem.analytics) {
      changes.push(historyItem.analytics ? t('consent.history.analyticsEnabled') : t('consent.history.analyticsDisabled'));
    }
    if (historyItem.marketing !== prevItem.marketing) {
      changes.push(historyItem.marketing ? t('consent.history.marketingEnabled') : t('consent.history.marketingDisabled'));
    }
    if (historyItem.preferences !== prevItem.preferences) {
      changes.push(historyItem.preferences ? t('consent.history.preferencesEnabled') : t('consent.history.preferencesDisabled'));
    }
    return changes.length > 0 ? changes : [t('consent.history.noChanges')];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">{t('consent.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-orange-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-lg font-semibold">{t('consent.noData')}</h2>
        </div>
        <p className="text-gray-600">{t('consent.noDataDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consent Toggles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-orange-500" />
          <h2 className="text-lg font-semibold">{t('consent.title')}</h2>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Functional - Always enabled */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900">{t('consent.functional.title')}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {t('consent.functional.required')}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {t('consent.functional.description')}
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

          {/* Analytics */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{t('consent.analytics.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('consent.analytics.description')}
              </p>
            </div>
            <div className="ml-4 flex items-center">
              <button
                onClick={() => handleToggle('analytics', !consent.analytics)}
                disabled={updating}
                className={`w-11 h-6 rounded-full transition-colors ${
                  consent.analytics ? 'bg-orange-500' : 'bg-gray-300'
                } flex items-center ${
                  consent.analytics ? 'justify-end' : 'justify-start'
                } px-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Toggle analytics cookies ${consent.analytics ? 'off' : 'on'}`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow"></div>
              </button>
            </div>
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{t('consent.marketing.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('consent.marketing.description')}
              </p>
            </div>
            <div className="ml-4 flex items-center">
              <button
                onClick={() => handleToggle('marketing', !consent.marketing)}
                disabled={updating}
                className={`w-11 h-6 rounded-full transition-colors ${
                  consent.marketing ? 'bg-orange-500' : 'bg-gray-300'
                } flex items-center ${
                  consent.marketing ? 'justify-end' : 'justify-start'
                } px-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Toggle marketing cookies ${consent.marketing ? 'off' : 'on'}`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow"></div>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{t('consent.preferences.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('consent.preferences.description')}
              </p>
            </div>
            <div className="ml-4 flex items-center">
              <button
                onClick={() => handleToggle('preferences', !consent.preferences)}
                disabled={updating}
                className={`w-11 h-6 rounded-full transition-colors ${
                  consent.preferences ? 'bg-orange-500' : 'bg-gray-300'
                } flex items-center ${
                  consent.preferences ? 'justify-end' : 'justify-start'
                } px-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Toggle preference cookies ${consent.preferences ? 'off' : 'on'}`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow"></div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          {t('consent.lastUpdated')}: {formatDate(consent.lastUpdatedAt)}
        </div>
      </div>

      {/* Consent History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">{t('consent.history.title')}</h3>
          </div>
          <div className="space-y-3">
            {history.slice(0, 5).map((item, index) => {
              const changes = getChangedFields(item, history[index + 1]);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {formatDate(item.changedAt)}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {changes.map((change, i) => (
                        <div key={i}>{change}</div>
                      ))}
                    </div>
                    {item.changeReason && (
                      <div className="text-gray-500 text-xs mt-1 italic">
                        {t('consent.history.reason')}: {item.changeReason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {history.length > 5 && (
            <div className="mt-3 text-center text-sm text-gray-500">
              {t('consent.history.showing')} 5 {t('consent.history.of')} {history.length} {t('consent.history.changes')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsentManager;
