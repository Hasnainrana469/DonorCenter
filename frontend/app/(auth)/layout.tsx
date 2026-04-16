import Link from 'next/link';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left branding panel ── */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="hidden lg:flex"
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg,#e12454,#8b0000)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 4px 16px rgba(225,36,84,.4)',
          }}>🩸</div>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>Blood Donor Connect</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#e12454' }}>Save Lives</div>
          </div>
        </Link>

        {/* Main copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 3vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            Every Drop<br />
            <span style={{ color: '#e12454' }}>Saves</span> a Life.
          </h2>
          <p style={{ color: '#b0b8cc', fontSize: 15, maxWidth: 340, marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of donors and patients connected through our AI-powered emergency blood network.
          </p>

          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[{ v: '10K+', l: 'Donors' }, { v: '5K+', l: 'Lives Saved' }, { v: '50+', l: 'Cities' }].map((s) => (
              <div key={s.l} style={{
                textAlign: 'center', padding: '16px 8px',
                background: 'rgba(255,255,255,.07)',
                borderRadius: 14, border: '1px solid rgba(255,255,255,.1)',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: '#e12454' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Blood type pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BLOOD_TYPES.map((bt) => (
            <span key={bt} style={{
              padding: '4px 14px', borderRadius: 50,
              background: 'rgba(225,36,84,.2)',
              border: '1px solid rgba(225,36,84,.35)',
              fontSize: 12, fontWeight: 700, color: '#fff',
            }}>{bt}</span>
          ))}
        </div>

        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,36,84,.15), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,.1), transparent)', pointerEvents: 'none' }} />
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: '#f7f8fa',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="lg:hidden">
            <div style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg,#e12454,#8b0000)',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, margin: '0 auto 12px',
            }}>🩸</div>
            <h1 style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 20 }}>Blood Donor Connect</h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Saving lives, one drop at a time</p>
          </div>

          {/* Form card */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: '36px 36px',
            boxShadow: '0 8px 40px rgba(0,0,0,.1)',
            border: '1px solid #ebebeb',
          }}>
            {children}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 20 }}>
            © 2026 Blood Donor Connect · Built to save lives
          </p>
        </div>
      </div>
    </div>
  );
}
