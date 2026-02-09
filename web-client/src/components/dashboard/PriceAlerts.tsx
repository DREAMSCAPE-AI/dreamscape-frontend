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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">{t('priceAlerts.title')}</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">{t('priceAlerts.createNewAlert')}</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t('priceAlerts.fromPlaceholder')}
                value={newAlert.origin}
                onChange={(e) => setNewAlert(prev => ({ ...prev, origin: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                placeholder={t('priceAlerts.toPlaceholder')}
                value={newAlert.destination}
                onChange={(e) => setNewAlert(prev => ({ ...prev, destination: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder={t('priceAlerts.targetPricePlaceholder')}
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <input
                type="date"
                value={newAlert.departureDate}
                onChange={(e) => setNewAlert(prev => ({ ...prev, departureDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={handleCreateAlert}
              disabled={isCreating || !newAlert.origin || !newAlert.destination || !newAlert.targetPrice}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isCreating ? t('priceAlerts.creating') : t('priceAlerts.createAlert')}
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t('priceAlerts.noAlerts')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('priceAlerts.noAlertsHint')}</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{alert.route}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{t('priceAlerts.target')}: ${alert.targetPrice}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{t('priceAlerts.current')}: ${alert.currentPrice}</span>
                  </div>
                  {alert.priceChange && (
                    <div className="flex items-center gap-1 mt-1">
                      {alert.priceChange > 0 ? (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-green-500" />
                      )}
                      <span className={`text-xs ${alert.priceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {alert.priceChange > 0 ? '+' : ''}${Math.abs(alert.priceChange)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {t('priceAlerts.notificationHint')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;
