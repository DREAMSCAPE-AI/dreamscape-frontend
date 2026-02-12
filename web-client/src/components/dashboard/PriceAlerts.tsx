import React, { useState } from 'react';
import { Bell, Plus, X, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PriceAlert {
  id: string;
  route: string;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  priceChange?: number;
}

interface PriceAlertsProps {
  alerts: PriceAlert[];
  onCreateAlert: (alertData: any) => Promise<any>;
}

const PriceAlerts: React.FC<PriceAlertsProps> = ({ alerts, onCreateAlert }) => {
  const { t } = useTranslation('dashboard');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    origin: '',
    destination: '',
    targetPrice: '',
    departureDate: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAlert = async () => {
    if (!newAlert.origin || !newAlert.destination || !newAlert.targetPrice) return;

    setIsCreating(true);
    try {
      await onCreateAlert({
        route: `${newAlert.origin} → ${newAlert.destination}`,
        targetPrice: parseFloat(newAlert.targetPrice),
        departureDate: newAlert.departureDate,
        currency: 'USD'
      });
      
      setNewAlert({ origin: '', destination: '', targetPrice: '', departureDate: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create price alert:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-orange-500" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">{t('priceAlerts.title')}</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          aria-label={showCreateForm ? t('priceAlerts.closeForm') : t('priceAlerts.createNew')}
        >
          {showCreateForm ? <X className="w-4 h-4 flex-shrink-0" /> : <Plus className="w-4 h-4 flex-shrink-0" />}
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm md:text-base font-medium text-gray-800 mb-3">{t('priceAlerts.createNewAlert')}</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t('priceAlerts.fromPlaceholder')}
                value={newAlert.origin}
                onChange={(e) => setNewAlert(prev => ({ ...prev, origin: e.target.value }))}
                className="px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs md:text-sm"
                aria-label={t('priceAlerts.fromLabel')}
              />
              <input
                type="text"
                placeholder={t('priceAlerts.toPlaceholder')}
                value={newAlert.destination}
                onChange={(e) => setNewAlert(prev => ({ ...prev, destination: e.target.value }))}
                className="px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs md:text-sm"
                aria-label={t('priceAlerts.toLabel')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="number"
                placeholder={t('priceAlerts.targetPricePlaceholder')}
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                className="px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs md:text-sm"
                aria-label={t('priceAlerts.targetPriceLabel')}
              />
              <input
                type="date"
                value={newAlert.departureDate}
                onChange={(e) => setNewAlert(prev => ({ ...prev, departureDate: e.target.value }))}
                className="px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs md:text-sm"
                aria-label={t('priceAlerts.dateLabel')}
              />
            </div>
            <button
              onClick={handleCreateAlert}
              disabled={isCreating || !newAlert.origin || !newAlert.destination || !newAlert.targetPrice}
              className="w-full px-4 py-2.5 min-h-[48px] text-xs md:text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              aria-label={isCreating ? t('priceAlerts.creating') : t('priceAlerts.createAlert')}
            >
              {isCreating ? t('priceAlerts.creating') : t('priceAlerts.createAlert')}
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-2 md:space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 md:py-8">
            <Bell className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm md:text-base text-gray-500">{t('priceAlerts.noAlerts')}</p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">{t('priceAlerts.noAlertsHint')}</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{alert.route}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{t('priceAlerts.target')}: ${alert.targetPrice}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{t('priceAlerts.current')}: ${alert.currentPrice}</span>
                  </div>
                  {alert.priceChange && (
                    <div className="flex items-center gap-1 mt-1">
                      {alert.priceChange > 0 ? (
                        <TrendingUp className="w-3 h-3 flex-shrink-0 text-red-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 flex-shrink-0 text-green-500" />
                      )}
                      <span className={`text-xs ${alert.priceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {alert.priceChange > 0 ? '+' : ''}${Math.abs(alert.priceChange)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    aria-label={alert.isActive ? t('priceAlerts.active') : t('priceAlerts.inactive')}
                  ></div>
                  <button
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={t('priceAlerts.deleteAlert')}
                  >
                    <X className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {t('priceAlerts.notificationHint')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;
