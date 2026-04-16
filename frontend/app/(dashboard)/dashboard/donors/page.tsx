'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { DonorProfile } from '@/lib/types';
import { BLOOD_TYPES } from '@/lib/constants';
import { Search, MapPin, Star, Heart } from 'lucide-react';
import Link from 'next/link';

function DonorsPageInner() {
  const searchParams = useSearchParams();
  const presetBloodType = searchParams.get('blood_type') || '';

  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ blood_type: presetBloodType, city: '', is_available: '' });
  const [search, setSearch] = useState('');

  const fetchDonors = async (f = filters, s = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.blood_type) params.set('blood_type', f.blood_type);
      if (f.city) params.set('city', f.city);
      if (f.is_available) params.set('is_available', f.is_available);
      if (s) params.set('search', s);
      const res = await api.get(`/donors/profiles/?${params}`);
      setDonors(res.data.results || res.data);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount (picks up preset blood_type from URL) and on filter change
  useEffect(() => { fetchDonors(); }, [filters]);

  // If URL param changes (e.g. navigating from hero tiles)
  useEffect(() => {
    if (presetBloodType) {
      setFilters((f) => ({ ...f, blood_type: presetBloodType }));
    }
  }, [presetBloodType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Donors</h1>
          {filters.blood_type && (
            <p style={{ color: '#e12454', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
              Showing donors for blood type: <span style={{ background: '#fde8ee', padding: '2px 10px', borderRadius: 50 }}>{filters.blood_type}</span>
              <button onClick={() => setFilters((f) => ({ ...f, blood_type: '' }))}
                style={{ marginLeft: 8, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                ✕ Clear
              </button>
            </p>
          )}
        </div>
        <Link href="/dashboard/donors/register" className="btn-primary flex items-center gap-2">
          <Heart size={16} />
          Register as Donor
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search by city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDonors()}
            />
          </div>
          <select
            className="input"
            value={filters.blood_type}
            onChange={(e) => setFilters({ ...filters, blood_type: e.target.value })}
          >
            <option value="">All Blood Types</option>
            {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>
          <input
            className="input"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <select
            className="input"
            value={filters.is_available}
            onChange={(e) => setFilters({ ...filters, is_available: e.target.value })}
          >
            <option value="">All Donors</option>
            <option value="true">Available Only</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Donor Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No donors found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((donor) => (
            <div key={donor.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-red-600">
                      {donor.user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{donor.user.username}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      {donor.user.city}, {donor.user.country}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="block bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-lg">
                    {donor.blood_type}
                  </span>
                  <span className={`block text-xs mt-1 font-medium ${donor.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                    {donor.is_available ? '● Available' : '○ Unavailable'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{donor.total_donations}</p>
                  <p className="text-xs text-gray-500">Donations</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{donor.age}</p>
                  <p className="text-xs text-gray-500">Age</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <p className="text-sm font-bold text-gray-900">{donor.average_rating.toFixed(1)}</p>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>

              {donor.bio && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{donor.bio}</p>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/chat?user=${donor.user.id}`}
                  className="btn-secondary flex-1 text-center text-sm py-2"
                >
                  Message
                </Link>
                <Link
                  href={`/dashboard/donors/${donor.id}`}
                  className="btn-primary flex-1 text-center text-sm py-2"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DonorsPage() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-48" />)}
      </div>
    }>
      <DonorsPageInner />
    </Suspense>
  );
}
