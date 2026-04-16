'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { BloodRequest, DonorProfile } from '@/lib/types';
import { URGENCY_COLORS, STATUS_COLORS } from '@/lib/constants';
import { Droplets, Users, Calendar, AlertTriangle, MapPin, Star, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  total_requests: number;
  open_requests: number;
  total_donors: number;
  available_donors: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats>({ total_requests: 0, open_requests: 0, total_donors: 0, available_donors: 0 });
  const [recentRequests, setRecentRequests] = useState<BloodRequest[]>([]);
  const [nearbyDonors, setNearbyDonors] = useState<DonorProfile[]>([]);

  useEffect(() => {
    api.get('/requests/?ordering=-created_at&page_size=5').then((res) => {
      const data = res.data.results || res.data;
      setRecentRequests(data);
      setStats((s) => ({ ...s, total_requests: res.data.count || data.length, open_requests: data.filter((r: BloodRequest) => r.status === 'open').length }));
    }).catch(() => {});

    api.get('/donors/profiles/?is_available=true').then((res) => {
      const donors = res.data.results || res.data;
      setNearbyDonors(donors.slice(0, 4));
      setStats((s) => ({ ...s, total_donors: res.data.count || donors.length, available_donors: donors.length }));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Requests',    value: stats.total_requests,  icon: Droplets,      color: '#e12454', bg: '#fde8ee' },
    { label: 'Open Requests',     value: stats.open_requests,   icon: AlertTriangle, color: '#f97316', bg: '#fff7ed' },
    { label: 'Total Donors',      value: stats.total_donors,    icon: Users,         color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Available Now',     value: stats.available_donors,icon: Heart,         color: '#10b981', bg: '#ecfdf5' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="blood-gradient rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-red-200 text-sm font-medium mb-1">Welcome back 👋</p>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {user?.username}
          </h1>
          <p className="text-red-100 text-sm max-w-md">
            Here&apos;s what&apos;s happening in the blood donor network today.
            {stats.open_requests > 0 && (
              <span className="ml-1 font-semibold text-white">
                {stats.open_requests} request{stats.open_requests !== 1 ? 's' : ''} need{stats.open_requests === 1 ? 's' : ''} attention.
              </span>
            )}
          </p>
          <Link href="/dashboard/requests/new" className="btn-white mt-5 inline-block text-sm px-6 py-2.5">
            🚨 Post Emergency Request
          </Link>
        </div>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 right-24 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-4 text-6xl opacity-20">🩸</div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: card.bg }}>
              <card.icon size={22} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Droplets size={18} style={{ color: 'var(--primary)' }} />
              Recent Blood Requests
            </h2>
            <Link href="/dashboard/requests" className="text-xs font-semibold flex items-center gap-1"
              style={{ color: 'var(--primary)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Droplets size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors">
                  <div className="w-10 h-10 blood-gradient rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {req.blood_type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{req.hospital_name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin size={10} /> {req.city}
                      <span className="mx-1">·</span>
                      {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${URGENCY_COLORS[req.urgency]}`}>{req.urgency}</span>
                    <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Donors */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} style={{ color: 'var(--primary)' }} />
              Available Donors
            </h2>
            <Link href="/dashboard/donors" className="text-xs font-semibold flex items-center gap-1"
              style={{ color: 'var(--primary)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {nearbyDonors.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No donors available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyDonors.map((donor) => (
                <div key={donor.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {donor.user.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{donor.user.username}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-6 h-6 blood-gradient rounded-md flex items-center justify-center text-white font-bold text-[10px]">
                        {donor.blood_type}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <MapPin size={10} /> {donor.user.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      <Star size={11} fill="currentColor" />
                      {donor.average_rating.toFixed(1)}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/donors/register', icon: '🩸', label: 'Register as Donor',  color: '#fde8ee', text: '#e12454' },
            { href: '/dashboard/requests/new',    icon: '🚨', label: 'Emergency Request',  color: '#fff7ed', text: '#f97316' },
            { href: '/dashboard/appointments',    icon: '📅', label: 'Book Appointment',   color: '#f5f3ff', text: '#8b5cf6' },
            { href: '/dashboard/eligibility',     icon: '✅', label: 'Check Eligibility',  color: '#ecfdf5', text: '#10b981' },
          ].map((action) => (
            <Link key={action.href} href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all hover:scale-105"
              style={{ background: action.color }}>
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-semibold" style={{ color: action.text }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
