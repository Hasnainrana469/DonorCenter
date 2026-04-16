'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BloodRequest } from '@/lib/types';
import { BLOOD_TYPES, URGENCY_COLORS, STATUS_COLORS } from '@/lib/constants';
import { Plus, MapPin, Phone, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ blood_type: '', urgency: '', status: 'open', city: '' });
  const [responding, setResponding] = useState<number | null>(null);
  const [responded, setResponded] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
        const res = await api.get(`/requests/?${params}&ordering=-created_at`);
        setRequests(res.data.results || res.data);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [filters]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleRespond = async (reqId: number) => {
    if (responding || responded.has(reqId)) return;
    setResponding(reqId);
    try {
      await api.post(`/requests/${reqId}/respond/`, { message: 'I can help!' });
      setResponded((prev) => new Set([...prev, reqId]));
      setRequests((prev) => prev.map((r) =>
        r.id === reqId ? { ...r, responses_count: r.responses_count + 1 } : r
      ));
      showToast('✅ Response sent! The requester has been notified.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast(msg || '❌ Failed to respond. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${toast.startsWith('✅') ? '#86efac' : '#fca5a5'}`,
          color: toast.startsWith('✅') ? '#166534' : '#991b1b',
          padding: '12px 20px', borderRadius: 12,
          fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,.1)',
        }}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
        <Link href="/dashboard/requests/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select className="input" value={filters.blood_type}
            onChange={(e) => setFilters({ ...filters, blood_type: e.target.value })}>
            <option value="">All Blood Types</option>
            {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>
          <select className="input" value={filters.urgency}
            onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}>
            <option value="">All Urgency</option>
            {['low', 'medium', 'high', 'critical'].map((u) => (
              <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
            ))}
          </select>
          <select className="input" value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            {['open', 'in_progress', 'fulfilled', 'cancelled'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <input className="input" placeholder="City" value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        </div>
      </div>

      {/* Requests */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No blood requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className={`card hover:shadow-md transition-shadow ${req.urgency === 'critical' ? 'border-red-200 bg-red-50/30' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 blood-gradient rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {req.blood_type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{req.hospital_name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={13} />{req.city}, {req.country}</span>
                        <span className="flex items-center gap-1"><Phone size={13} />{req.contact_phone}</span>
                        <span className="flex items-center gap-1"><Clock size={13} />
                          {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`badge ${URGENCY_COLORS[req.urgency]}`}>{req.urgency}</span>
                      <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-gray-600">
                      <strong>{req.units_needed}</strong> units needed · Patient: <strong>{req.patient_name}</strong>
                    </span>
                    <span className="text-sm text-gray-500">{req.responses_count} responses</span>
                    <div className="ml-auto flex gap-2">
                      <Link href={`/dashboard/requests/${req.id}`} className="btn-secondary text-sm py-1.5 px-4">
                        Details
                      </Link>
                      {req.status === 'open' && (
                        <button
                          onClick={() => handleRespond(req.id)}
                          disabled={responding === req.id || responded.has(req.id)}
                          className="btn-primary text-sm py-1.5 px-4 flex items-center gap-1.5"
                        >
                          {responded.has(req.id) ? (
                            <><CheckCircle2 size={14} /> Responded</>
                          ) : responding === req.id ? (
                            'Sending...'
                          ) : (
                            'Respond'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
