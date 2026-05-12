'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  ['/', 'Home'],
  ['/dashboard/donors', 'Find Donors'],
  ['/dashboard/requests', 'Blood Requests'],
  ['/dashboard/blood-stock', 'Blood Stock'],
  ['/dashboard', 'Dashboard'],
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #ebebeb',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 16px rgba(0,0,0,.06)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg,#e12454,#8b0000)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 12px rgba(225,36,84,.3)',
          }}>🩸</div>
          <div>
            <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14, lineHeight: 1.2 }}>Blood Donor</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e12454' }}>Connect</div>
          </div>
        </Link>

        {/* Desktop links — always visible on ≥992px */}
        <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}
          className="hidden-mobile">
          {NAV_LINKS.map(([href, label]) => (
            <Link key={href} href={href} style={{
              color: '#444', textDecoration: 'none', fontWeight: 500, fontSize: 14,
              transition: 'color .2s', padding: '4px 0', position: 'relative',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#e12454'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#444'; }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div style={{ display: 'flex', gap: 10 }} className="hidden-mobile">
          <Link href="/login"    className="btn btn-outline" style={{ padding: '9px 22px' }}>Sign In</Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '9px 22px' }}>Donate Now</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="show-mobile"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#1a1a2e' }}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          background: '#fff', borderTop: '1px solid #ebebeb',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4,
        }} className="show-mobile">
          {NAV_LINKS.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              color: '#444', textDecoration: 'none', fontWeight: 500, fontSize: 15,
              padding: '10px 0', borderBottom: '1px solid #f5f5f5', display: 'block',
              transition: 'color .2s',
            }}>
              {label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Link href="/login"    className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }} onClick={() => setOpen(false)}>Sign In</Link>
            <Link href="/register" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setOpen(false)}>Donate Now</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none !important; }
        }
        @media (max-width: 991px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
