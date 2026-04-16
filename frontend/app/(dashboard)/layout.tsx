'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useNotificationStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { Bell, Search } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const { unreadCount, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/notifications/unread-count/').then((res) => {
      setUnreadCount(res.data.unread_count);
    }).catch(() => {});
  }, [user, router, setUnreadCount]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 py-2 text-sm w-64"
              placeholder="Search donors, requests..."
              style={{ borderRadius: '50px', background: '#f9f9f9' }}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Emergency CTA */}
            <Link href="/dashboard/requests/new" className="btn-primary text-xs py-2 px-4">
              🚨 Emergency Request
            </Link>

            {/* Notifications */}
            <Link href="/dashboard/notifications" className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 blood-gradient rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.username}</p>
                <p className="text-[10px] capitalize" style={{ color: 'var(--primary)' }}>{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
