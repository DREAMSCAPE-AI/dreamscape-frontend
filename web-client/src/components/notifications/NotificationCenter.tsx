import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import notificationService, { Notification } from '../../services/user/NotificationService';

interface NotificationCenterProps {
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Load notifications
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await notificationService.getNotifications(filter);
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error('[NotificationCenter] Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  // Real-time: listen for new notifications
  useEffect(() => {
    const handleNew = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      onUnreadCountChange(0); // trigger parent to re-fetch count
    };

    notificationService.onNewNotification(handleNew);
    return () => notificationService.offNewNotification(handleNew);
  }, [onUnreadCountChange]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
      );
      const count = await notificationService.getUnreadCount();
      onUnreadCountChange(count);
    } catch (err) {
      console.error('[NotificationCenter] Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })));
      onUnreadCountChange(0);
    } catch (err) {
      console.error('[NotificationCenter] Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              title="Tout marquer comme lu"
              className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-100">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              filter === f
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : 'Lues'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Bell className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-orange-50/40' : ''
              }`}
            >
              {/* Unread dot */}
              <div className="mt-1.5 flex-shrink-0">
                {!notification.read ? (
                  <span className="w-2 h-2 rounded-full bg-orange-500 block" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-200 block" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-tight">{notification.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Mark as read button */}
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Marquer comme lu"
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
