import React, { useState } from 'react';
import { Bell, Plus, X, TrendingDown, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [newAlert, setNewAlert] = useState({ origin: '', destination: '', targetPrice: '', departureDate: '' });
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
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold tracking-tight text-surface-900">{t('priceAlerts.title')}</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
          aria-label={showCreateForm ? t('priceAlerts.closeForm') : t('priceAlerts.createNew')}
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-5 p-4 bg-surface-50 rounded-xl border border-surface-200/50 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text" placeholder={t('priceAlerts.fromPlaceholder')} value={newAlert.origin}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, origin: e.target.value }))}
                  className="px-3 py-2.5 min-h-[44px] text-sm bg-white border border-surface-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  aria-label={t('priceAlerts.fromLabel')}
                />
                <input
                  type="text" placeholder={t('priceAlerts.toPlaceholder')} value={newAlert.destination}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, destination: e.target.value }))}
                  className="px-3 py-2.5 min-h-[44px] text-sm bg-white border border-surface-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  aria-label={t('priceAlerts.toLabel')}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number" placeholder={t('priceAlerts.targetPricePlaceholder')} value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                  className="px-3 py-2.5 min-h-[44px] text-sm bg-white border border-surface-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  aria-label={t('priceAlerts.targetPriceLabel')}
                />
                <input
                  type="date" value={newAlert.departureDate}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="px-3 py-2.5 min-h-[44px] text-sm bg-white border border-surface-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  aria-label={t('priceAlerts.dateLabel')}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateAlert}
                disabled={isCreating || !newAlert.origin || !newAlert.destination || !newAlert.targetPrice}
                className="w-full py-2.5 text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none transition-shadow"
                aria-label={isCreating ? t('priceAlerts.creating') : t('priceAlerts.createAlert')}
              >
                {isCreating ? t('priceAlerts.creating') : t('priceAlerts.createAlert')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100/50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('priceAlerts.noAlerts')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('priceAlerts.noAlertsHint')}</p>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create your first alert
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-3 bg-surface-50/50 hover:bg-surface-100/80 rounded-xl transition-colors group">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alert.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <p className="text-sm font-bold tracking-tight text-surface-900 truncate">{alert.route}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-3.5">
                    <span className="text-xs text-gray-400">
                      ${alert.currentPrice} <span className="text-gray-300">/</span> ${alert.targetPrice} target
                    </span>
                    {alert.priceChange && (
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${alert.priceChange > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {alert.priceChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {alert.priceChange > 0 ? '+' : ''}${Math.abs(alert.priceChange)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={t('priceAlerts.deleteAlert')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;
