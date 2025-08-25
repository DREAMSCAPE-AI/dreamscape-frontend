import React, { useState } from 'react';
import { MessageSquare, Phone, Calendar, Clock, Crown, X } from 'lucide-react';

interface PersonalConciergeProps {
  onClose: () => void;
  onSubmit: (request: ConciergeRequest) => void;
}

interface ConciergeRequest {
  type: 'chat' | 'call' | 'meeting';
  preferredTime?: string;
  message: string;
  priority: 'normal' | 'urgent';
}

const PersonalConcierge: React.FC<PersonalConciergeProps> = ({ onClose, onSubmit }) => {
  const [request, setRequest] = useState<ConciergeRequest>({
    type: 'chat',
    message: '',
    priority: 'normal'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold">Personal Concierge</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you like to connect?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: 'chat', label: 'Live Chat', icon: MessageSquare },
                  { type: 'call', label: 'Phone Call', icon: Phone },
                  { type: 'meeting', label: 'Video Meeting', icon: Calendar }
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setRequest(prev => ({ ...prev, type: type as ConciergeRequest['type'] }))}
                    className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      request.type === type
                        ? 'bg-orange-50 text-orange-600 border-2 border-orange-500'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Time */}
            {request.type !== 'chat' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      onChange={(e) => setRequest(prev => ({ ...prev, preferredTime: e.target.value }))}
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (9AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 5PM)</option>
                      <option value="evening">Evening (5PM - 8PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How can we assist you?
              </label>
              <textarea
                value={request.message}
                onChange={(e) => setRequest(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                rows={4}
                placeholder="Describe your request or preferences..."
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Priority
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'normal', label: 'Normal' },
                  { value: 'urgent', label: 'Urgent' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setRequest(prev => ({ ...prev, priority: value as 'normal' | 'urgent' }))}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      request.priority === value
                        ? 'bg-orange-50 text-orange-600 border-2 border-orange-500'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Average response time: 2 minutes</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(request)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalConcierge;