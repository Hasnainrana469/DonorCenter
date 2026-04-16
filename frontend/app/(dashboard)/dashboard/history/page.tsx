'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ClipboardList, Heart, Award, Droplets, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface DonationRecord {
  id: number;
  donation_date: string;
  units_donated: number;
  hospital: string;
  status: string;
  notes: string;
  blood_request?: number;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending:   'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_DOT: Record<string, string> = {
  completed: '#22c55e',
  pending:   '#f59e0b',
  cancelled: '#ef4444',
};

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDonor, setIsDonor] = useState(false);

  useEffect(() => {
    if (user?.role === 'donor' || user?.role === 'admin') {
      setIsDonor(true);
      api.get('/donors/history/')
        .then((res) => setHistory(res.data.results || res.data))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const completed = history.filter((h) => h.status === 'completed');
  const totalUnits = completed.reduce((s, h) => s + h.units_donated, 0);
  const livesImpacted = completed.length * 3;

  // ── Patient view ──────────────────────────────────────────────────────────
  if (!loading && !isDonor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
          <p className="text-gray-500 mt-1">Track your blood donation journey</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg,#e12454,#8b0000)',
          borderRadius: 20, padding: '40px 36px', color: '#fff', textAlign: 'center',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🩸</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
            Become a Blood Donor
          </h2>
          <p style={{ color: 'rgba(255,255,255,.8)', maxWidth: 420, margin: '0 auto 24px', fontSize: 15, lineHeight: 1.65 }}>
            You&apos;re currently registered as a patient. Register as a donor to start tracking
            your donation history and save lives.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard/donors/register"
              style={{ background: '#fff', color: '#e12454', fontWeight: 700, padding: '12px 28px', borderRadius: 50, textDecoration: 'none', fontSize: 14 }}>
              Register as Donor
            </Link>
            <Link href="/dashboard/eligibility"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontWeight: 600, padding: '12px 28px', borderRadius: 50, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,.3)' }}>
              Check Eligibility First
            </Link>
          </div>
        </div>

        {/* Why donate */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '❤️', title: 'Save 3 Lives',      desc: 'One donation can save up to 3 lives.' },
            { icon: '🏆', title: 'Earn Recognition',  desc: 'Build your donor rating and history.' },
            { icon: '🌍', title: 'Join the Network',  desc: 'Connect with patients who need you.' },
          ].map((item) => (
            <div key={item.title} className="card text-center">
              <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
              <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14, marginBottom: 6 }}>{item.title}</p>
              <p style={{ color: '#888', fontSize: 13 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Donor view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
        <p className="text-gray-500 mt-1">Your complete blood donation record</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Donations', value: completed.length,          icon: Droplets,      color: '#e12454', bg: '#fde8ee' },
          { label: 'Units Donated',   value: totalUnits.toFixed(1),     icon: Heart,         color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Lives Impacted',  value: livesImpacted,             icon: Award,         color: '#10b981', bg: '#ecfdf5' },
          { label: 'All Records',     value: history.length,            icon: ClipboardList, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement badge */}
      {completed.length >= 5 && (
        <div style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, color: '#fff' }}>
          <span style={{ fontSize: 36 }}>🏆</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>
              {completed.length >= 10 ? 'Platinum Donor' : completed.length >= 5 ? 'Gold Donor' : 'Silver Donor'}
            </p>
            <p style={{ fontSize: 13, opacity: .85 }}>
              You&apos;ve completed {completed.length} donations — you&apos;re a hero!
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
        </div>
      ) : history.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList size={44} className="text-gray-200 mx-auto mb-4" />
          <p style={{ fontWeight: 600, color: '#888', fontSize: 15 }}>No donation history yet</p>
          <p style={{ color: '#bbb', fontSize: 13, marginTop: 6 }}>Your donations will appear here after you donate</p>
          <Link href="/dashboard/appointments" className="btn-primary inline-block mt-5 text-sm">
            Book an Appointment
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
            <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>All Donations</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                {['Date', 'Hospital', 'Units', 'Status', 'Notes'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.08em', padding: '10px 16px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((record, idx) => (
                <tr key={record.id} style={{ borderBottom: idx < history.length - 1 ? '1px solid #f9f9f9' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fde8ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={14} color="#e12454" />
                      </div>
                      <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>
                        {format(new Date(record.donation_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#444' }}>{record.hospital || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 700, color: '#e12454', fontSize: 14 }}>{record.units_donated}</span>
                    <span style={{ fontSize: 11, color: '#aaa', marginLeft: 3 }}>unit{record.units_donated !== 1 ? 's' : ''}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 50, background: record.status === 'completed' ? '#ecfdf5' : record.status === 'pending' ? '#fffbeb' : '#fef2f2', color: STATUS_DOT[record.status] }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT[record.status], display: 'inline-block' }} />
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{record.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
