'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Notification } from '@/lib/types';
import { useNotificationStore } from '@/lib/store';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<string, string> = {
  emergency: '🚨',
  request_response: '💉',
  appointment: '📅',
  system: '⚙️',
  chat: '💬',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/notifications/');
        setNotifications(res.data.results || res.data);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const markAllRead = async () => {
    await api.post('/notifications/mark-read/');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
          <CheckCheck size={16} />
          Mark all read
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`card flex items-start gap-4 transition-all ${!notif.is_read ? 'border-red-100 bg-red-50/30' : ''}`}
            >
              <div className="text-2xl flex-shrink-0">{TYPE_ICONS[notif.notification_type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
