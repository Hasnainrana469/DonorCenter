'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useNotificationStore } from '@/lib/store';
import {
  LayoutDashboard, Users, Droplets, Calendar, MessageSquare,
  Bell, BarChart3, LogOut, Heart, ClipboardList, ShieldCheck,
  MapPin, Sparkles, Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',                icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/donors',         icon: Users,           label: 'Find Donors' },
  { href: '/dashboard/requests',       icon: Droplets,        label: 'Blood Requests' },
  { href: '/dashboard/ai-suggestions', icon: Sparkles,        label: 'AI Suggestions' },
  { href: '/dashboard/map',            icon: MapPin,          label: 'Live Map' },
  { href: '/dashboard/blood-stock',    icon: BarChart3,       label: 'Blood Stock' },
  { href: '/dashboard/appointments',   icon: Calendar,        label: 'Appointments' },
  { href: '/dashboard/chat',           icon: MessageSquare,   label: 'Live Chat' },
  { href: '/dashboard/notifications',  icon: Bell,            label: 'Notifications' },
  { href: '/dashboard/eligibility',    icon: ShieldCheck,     label: 'Eligibility Check' },
  { href: '/dashboard/history',        icon: ClipboardList,   label: 'Donation History' },
  { href: '/dashboard/profile',        icon: Heart,           label: 'My Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <aside style={{
      width: 240,
      background: '#fff',
      borderRight: '1px solid #ebebeb',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      boxShadow: '2px 0 16px rgba(0,0,0,.04)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg,#e12454,#8b0000)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, boxShadow: '0 3px 10px rgba(225,36,84,.3)',
          }}>🩸</div>
          <div>
            <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 13, lineHeight: 1.2 }}>Blood Donor</div>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#e12454' }}>Connect</div>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div style={{ margin: '12px 12px 4px', padding: '10px 12px', background: '#fde8ee', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg,#e12454,#8b0000)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: 11, color: '#e12454', fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          const isNotif = href === '/dashboard/notifications';
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10,
              fontSize: 13, fontWeight: 500,
              color: active ? '#fff' : '#64748b',
              background: active ? '#e12454' : 'transparent',
              textDecoration: 'none',
              marginBottom: 2,
              transition: 'all .18s',
            }}>
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {isNotif && unreadCount > 0 && (
                <span style={{
                  background: active ? '#fff' : '#e12454',
                  color: active ? '#e12454' : '#fff',
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 50, width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <Link href="/dashboard/admin" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10,
            fontSize: 13, fontWeight: 500,
            color: pathname === '/dashboard/admin' ? '#fff' : '#64748b',
            background: pathname === '/dashboard/admin' ? '#e12454' : 'transparent',
            textDecoration: 'none', marginBottom: 2,
          }}>
            <Settings size={16} />
            <span>Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px', borderTop: '1px solid #f0f0f0' }}>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 10,
          fontSize: 13, fontWeight: 500,
          color: '#ef4444', background: 'none',
          border: 'none', cursor: 'pointer', width: '100%',
          transition: 'background .18s',
        }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
