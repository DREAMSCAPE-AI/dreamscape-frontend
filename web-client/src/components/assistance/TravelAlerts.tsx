import React from 'react';
import { Bell, AlertTriangle, Globe, Plane, Clock } from 'lucide-react';

interface TravelAlertsProps {
  alerts: TravelAlert[];
  onDismiss: (alertId: string) => void;
  onAction?: (alertId: string, action: string) => void;
}

interface TravelAlert {
  id: string;
  type: 'flight' | 'weather' | 'security' | 'general';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actions?: {
    label: string;
    value: string;
  }[];
}

const TravelAlerts: React.FC<TravelAlertsProps> = ({
  alerts,
  onDismiss,
  onAction
}) => {
  const getAlertIcon = (type: TravelAlert['type']) => {
    switch (type) {
      case 'flight': return Plane;
      case 'weather': return Cloud;
      case 'security': return Shield;
      default: return Bell;
    }
  };

  const getAlertColors = (severity: TravelAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const Icon = getAlertIcon(alert.type);
        const colors = getAlertColors(alert.severity);

        return (
          <div
            key={alert.id}
            className={`relative p-4 border rounded-lg ${colors}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg bg-white/50`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm opacity-70">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="p-1 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {alert.actions && alert.actions.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {alert.actions.map((action) => (
                      <button
                        key={action.value}
                        onClick={() => onAction?.(alert.id, action.value)}
                        className="px-3 py-1 bg-white rounded-md text-sm hover:bg-white/80 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TravelAlerts;