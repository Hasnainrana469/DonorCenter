'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { URGENCY_COLORS, STATUS_COLORS } from '@/lib/constants';
import {
  Users, Droplets, Calendar, AlertTriangle, TrendingUp,
  UserCheck, Building2, Activity, ShieldAlert, CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminStats {
  total_users: number;
  total_donors: number;
  available_donors: number;
  total_requests: number;
  open_requests: number;
  critical_requests: number;
  fulfilled_requests: number;
  total_appointments: number;
  upcoming_appointments: number;
  critical_stocks: number;
  new_users_week: number;
  users_by_role: { role: string; count: number }[];
  requests_by_blood_type: { blood_type: string; count: number }[];
  recent_requests: {
    id: number; blood_type: string; urgency: string; status: string;
    hospital_name: string; city: string; created_at: string;
  }[];
  recent_users: { id: number; username: string; email: string; role: string; created_at: string }[];
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'users'>('overview');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    api.get('/auth/admin/stats/').then((res) => {
      setStats(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      </div>
    );
  }

  if (!stats) return <div className="card text-center py-12 text-gray-400">Failed to load admin stats.</div>;

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', sub: `+${stats.new_users_week} this week` },
    { label: 'Registered Donors', value: stats.total_donors, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', sub: `${stats.available_donors} available` },
    { label: 'Blood Requests', value: stats.total_requests, icon: Droplets, color: 'text-red-600', bg: 'bg-red-50', sub: `${stats.open_requests} open` },
    { label: 'Critical Requests', value: stats.critical_requests, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Needs immediate action' },
    { label: 'Fulfilled Requests', value: stats.fulfilled_requests, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Lives saved' },
    { label: 'Appointments', value: stats.total_appointments, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', sub: `${stats.upcoming_appointments} upcoming` },
    { label: 'Critical Stock', value: stats.critical_stocks, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', sub: 'Blood types below 5 units' },
    { label: 'Fulfillment Rate', value: `${stats.total_requests ? Math.round((stats.fulfilled_requests / stats.total_requests) * 100) : 0}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Of all requests' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">System overview and management</p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm font-medium">
          <Activity size={16} />
          Live System Status
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {(['overview', 'requests', 'users'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users by Role */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-red-600" /> Users by Role
            </h2>
            <div className="space-y-3">
              {stats.users_by_role.map((r) => {
                const pct = stats.total_users ? Math.round((r.count / stats.total_users) * 100) : 0;
                const colors: Record<string, string> = { donor: 'bg-green-500', patient: 'bg-blue-500', admin: 'bg-red-500' };
                return (
                  <div key={r.role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium text-gray-700">{r.role}</span>
                      <span className="text-gray-500">{r.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[r.role] || 'bg-gray-400'} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requests by Blood Type */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets size={18} className="text-red-600" /> Requests by Blood Type
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {stats.requests_by_blood_type.map((r) => (
                <div key={r.blood_type} className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 blood-gradient rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto mb-1">
                    {r.blood_type}
                  </div>
                  <p className="text-lg font-bold text-gray-900">{r.count}</p>
                  <p className="text-xs text-gray-400">requests</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Alert */}
          {stats.critical_stocks > 0 && (
            <div className="card border-red-200 bg-red-50 md:col-span-2">
              <div className="flex items-center gap-3">
                <ShieldAlert size={24} className="text-red-600" />
                <div>
                  <p className="font-bold text-red-800">⚠️ {stats.critical_stocks} blood type(s) critically low</p>
                  <p className="text-sm text-red-600">Immediate restocking required. Check Blood Stock page for details.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900">Recent Blood Requests</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Blood Type', 'Hospital', 'City', 'Urgency', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recent_requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="w-8 h-8 blood-gradient rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {req.blood_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{req.hospital_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{req.city}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${URGENCY_COLORS[req.urgency]}`}>{req.urgency}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900">Recent Users</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['User', 'Email', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recent_users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-red-600">{u.username[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-red-100 text-red-800' : u.role === 'donor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
