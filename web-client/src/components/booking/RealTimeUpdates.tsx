import React from 'react';
import { Bell, Check, AlertTriangle, Info, RefreshCw } from 'lucide-react';

interface RealTimeUpdatesProps {
  updates: Update[];
  onDismiss: (updateId: string) => void;
  onAction?: (updateId: string, action: string) => void;
}

interface Update {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actions?: {
    label: string;
    value: string;
  }[];
  dismissed?: boolean;
}

const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  updates,
  onDismiss,
  onAction
}) => {
  const getUpdateIcon = (type: Update['type']) => {
    switch (type) {
      case 'success': return Check;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getUpdateColors = (type: Update['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-700';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'error': return 'bg-red-50 border-red-200 text-red-700';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {updates.filter(update => !update.dismissed).map((update) => {
        const Icon = getUpdateIcon(update.type);
        const colors = getUpdateColors(update.type);

        return (
          <div
            key={update.id}
            className={`relative p-4 border rounded-lg ${colors}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg bg-white/50`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium">{update.title}</h4>
                    <p className="text-sm mt-1 opacity-90">{update.message}</p>
                  </div>
                  <button
                    onClick={() => onDismiss(update.id)}
                    className="p-1 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {update.actions && update.actions.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {update.actions.map((action) => (
                      <button
                        key={action.value}
                        onClick={() => onAction?.(update.id, action.value)}
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

export default RealTimeUpdates;