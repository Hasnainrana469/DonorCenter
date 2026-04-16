import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import SocialIcons from '@/components/SocialIcons';
import {
  Droplets, Users, Bell, MapPin, Shield, MessageSquare,
  Phone, Mail, Heart, Sparkles, Calendar, BarChart3,
  ChevronRight,
} from 'lucide-react';

const features = [
  { icon: Droplets,      title: 'Emergency Requests',  desc: 'Submit urgent blood requests and get matched with compatible donors in minutes.', href: '/dashboard/requests/new',    cta: 'Post Request' },
  { icon: Users,         title: 'Verified Donors',     desc: 'Connect with thousands of screened donors across your city and beyond.',          href: '/dashboard/donors',          cta: 'Find Donors' },
  { icon: Bell,          title: 'Real-Time Alerts',    desc: 'Instant SMS and push notifications for emergency blood needs near you.',           href: '/dashboard/notifications',   cta: 'View Alerts' },
  { icon: MapPin,        title: 'Location Search',     desc: 'Find the nearest available donors using our GPS-powered live map.',               href: '/dashboard/map',             cta: 'Open Map' },
  { icon: Shield,        title: 'Eligibility Checker', desc: "Instantly check if you're eligible to donate with our smart health tool.",        href: '/dashboard/eligibility',     cta: 'Check Now' },
  { icon: MessageSquare, title: 'Live Chat',            desc: 'Communicate directly with donors and patients in real-time.',                     href: '/dashboard/chat',            cta: 'Start Chat' },
  { icon: Sparkles,      title: 'AI Matching',         desc: 'Smart scoring ranks donors by compatibility, rating, and proximity.',             href: '/dashboard/ai-suggestions',  cta: 'Get Suggestions' },
  { icon: Calendar,      title: 'Appointments',        desc: 'Schedule donation appointments at hospitals with one click.',                      href: '/dashboard/appointments',    cta: 'Book Now' },
  { icon: BarChart3,     title: 'Blood Stock',         desc: 'Monitor real-time blood availability across all registered blood banks.',         href: '/dashboard/blood-stock',     cta: 'View Stock' },
];

const stats = [
  { value: '10,000+', label: 'Registered Donors' },
  { value: '5,000+',  label: 'Lives Saved' },
  { value: '50+',     label: 'Cities Covered' },
  { value: '< 5 min', label: 'Avg Response Time' },
];

const reasons = [
  { emoji: '❤️', title: 'Save Lives Instantly',  desc: 'Your blood can reach a patient in critical need within hours of donation.',  href: '/register' },
  { emoji: '🏥', title: 'Support Hospitals',     desc: 'Help blood banks maintain adequate stock for surgeries and emergencies.',     href: '/dashboard/blood-stock' },
  { emoji: '🌍', title: 'Build Community',       desc: 'Be part of a network of heroes who give the gift of life every day.',        href: '/dashboard/donors' },
];

const team = [
  { name: 'Dr. Sarah Khan',  role: 'Medical Director',     emoji: '👩‍⚕️' },
  { name: 'Ahmed Hassan',    role: 'Lead Donor Volunteer', emoji: '🧑‍💼' },
  { name: 'Maria Rodriguez', role: 'Community Manager',    emoji: '👩‍💻' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Bar ── */}
      <div style={{ background: '#1a1a2e', color: '#aaa', fontSize: 12, padding: '8px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="tel:+14545565656" style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={12} /> +1 (454) 556-5656
            </a>
            <a href="mailto:info@blooddonorconnect.com" style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={12} /> info@blooddonorconnect.com
            </a>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <SocialIcons variant="dark" size={13} />
          </div>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #ebebeb',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 16px rgba(0,0,0,.06)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg,#e12454,#8b0000)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 4px 12px rgba(225,36,84,.3)',
            }}>🩸</div>
            <div>
              <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14, lineHeight: 1.2 }}>Blood Donor</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e12454' }}>Connect</div>
            </div>
          </Link>

          <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
            {[['/', 'Home'], ['/dashboard/donors', 'Find Donors'], ['/dashboard/requests', 'Blood Requests'], ['/dashboard/blood-stock', 'Blood Stock'], ['/dashboard', 'Dashboard']].map(([href, label]) => (
              <Link key={href} href={href} className="nav-link">
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" className="btn btn-outline" style={{ padding: '9px 22px' }}>Sign In</Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '9px 22px' }}>Donate Now</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
        color: '#fff',
        padding: '100px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(225,36,84,.15)', border: '1px solid rgba(225,36,84,.3)',
              borderRadius: 50, padding: '6px 16px', fontSize: 12, marginBottom: 24,
            }}>
              <span style={{ width: 7, height: 7, background: '#e12454', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              Real-time donor matching active
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 20,
            }}>
              Every Drop<br />
              <span style={{ color: '#e12454' }}>Counts.</span><br />
              Save a Life.
            </h1>

            <p style={{ color: '#b0b8cc', fontSize: 16, maxWidth: 420, marginBottom: 36, lineHeight: 1.7 }}>
              The fastest way to connect blood donors with patients in emergency situations.
              AI-powered matching, real-time alerts, and live support — 24/7.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 32px' }}>
                Register as Donor
              </Link>
              <Link href="/dashboard/requests" className="btn btn-white" style={{ fontSize: 15, padding: '13px 32px' }}>
                Request Blood
              </Link>
            </div>
          </div>

          {/* Right — blood type grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {BLOOD_TYPES.map((bt) => (
              <Link
                key={bt}
                href={`/dashboard/donors?blood_type=${encodeURIComponent(bt)}`}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'rgba(225,36,84,.18)',
                  border: '1px solid rgba(225,36,84,.35)',
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'background .2s, transform .2s, box-shadow .2s',
                }}
                className="blood-type-tile"
              >
                {bt}
                <span style={{ fontSize: 10, fontWeight: 500, opacity: .7, letterSpacing: '.05em' }}>
                  Find Donors
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,36,84,.15), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,.1), transparent)', pointerEvents: 'none' }} />
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '56px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 800, color: '#e12454', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ color: '#888', fontSize: 13, marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Donate ── */}
      <section style={{ background: '#f9f9f9', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-tag">Why It Matters</span>
            <h2 className="section-heading">Reasons to Donate Blood</h2>
            <p style={{ color: '#888', marginTop: 12, maxWidth: 500, margin: '12px auto 0', fontSize: 15 }}>
              One donation can save up to three lives. Join our mission to ensure no patient suffers due to blood shortage.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {reasons.map((r) => (
              <Link key={r.title} href={r.href} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', padding: 36, cursor: 'pointer', height: '100%' }}>
                  <div style={{
                    width: 72, height: 72,
                    background: '#fde8ee',
                    borderRadius: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, margin: '0 auto 20px',
                  }}>
                    {r.emoji}
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 17, marginBottom: 10 }}>{r.title}</h3>
                  <p style={{ color: '#888', fontSize: 14, lineHeight: 1.65 }}>{r.desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#e12454', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
                    Get Involved <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: '#fff', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-tag">Platform Features</span>
            <h2 className="section-heading">Everything You Need to Save Lives</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map(({ icon: Icon, title, desc, href, cta }) => (
              <Link key={title} href={href} style={{ textDecoration: 'none' }}>
                <div className="card feature-card" style={{ padding: 28, height: '100%', cursor: 'pointer' }}>
                  <div style={{
                    width: 52, height: 52,
                    background: '#fde8ee',
                    borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16, transition: 'background .25s',
                  }} className="feature-icon-box">
                    <Icon size={22} color="#e12454" />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15, marginBottom: 8 }}>{title}</h3>
                  <p style={{ color: '#888', fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#e12454', fontSize: 13, fontWeight: 600 }}>
                    {cta} <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #e12454 0%, #8b0000 100%)',
        color: '#fff',
        padding: '80px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 10 }}>
            Take Action
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, marginBottom: 16 }}>
            Watch Our Latest Activities
          </h2>
          <p style={{ color: 'rgba(255,255,255,.8)', maxWidth: 560, margin: '0 auto 12px', fontSize: 15, lineHeight: 1.7 }}>
            Join thousands of donors who are making a real difference every single day.
            Every unit of blood you donate can save up to three lives.
          </p>
          <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: 480, margin: '0 auto 36px', fontSize: 14 }}>
            Our platform connects you instantly with patients in need, blood banks, and hospitals — all in one place, 24/7.
          </p>
          <Link href="/register" className="btn btn-white" style={{ fontSize: 15, padding: '13px 40px' }}>
            Donate Now
          </Link>
        </div>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
      </section>

      {/* ── Team ── */}
      <section style={{ background: '#f9f9f9', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-tag">Our People</span>
            <h2 className="section-heading">Meet Our Volunteers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {team.map((m) => (
              <div key={m.name} className="card" style={{ textAlign: 'center', padding: 36 }}>
                <div style={{
                  width: 88, height: 88,
                  background: '#fde8ee',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, margin: '0 auto 16px',
                }}>
                  {m.emoji}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                  <SocialIcons variant="light" size={12} />
                </div>
                <h3 style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 16 }}>{m.name}</h3>
                <p style={{ color: '#e12454', fontSize: 13, fontWeight: 500, marginTop: 4 }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Register CTA ── */}
      <section style={{ background: '#fff', padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="section-tag">Get Started</span>
            <h2 className="section-heading">Register as a Donor Today</h2>
            <p style={{ color: '#888', marginTop: 10, fontSize: 14 }}>
              It takes less than 2 minutes. Your blood type could be someone&apos;s lifeline.
            </p>
          </div>
          <div className="card" style={{ padding: 36 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 14 }}>Select your blood type:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
              {BLOOD_TYPES.map((bt) => (
                <label key={bt} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  border: '1.5px solid #ebebeb',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, color: '#333',
                  transition: 'all .2s',
                }}>
                  <input type="radio" name="blood_type" value={bt} style={{ accentColor: '#e12454' }} />
                  {bt}
                </label>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 0', textAlign: 'center' }}>
                Register as Donor
              </Link>
              <Link href="/login" className="btn btn-outline" style={{ fontSize: 15, padding: '13px 0', textAlign: 'center' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#1a1a2e', color: '#aaa' }}>
        <div className="container" style={{ padding: '64px 24px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr 1.2fr', gap: 40 }}>
          {/* About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#e12454,#8b0000)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🩸</div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Blood Donor Connect</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, marginBottom: 20 }}>
              Connecting blood donors with patients in emergency situations. AI-powered, real-time, and available 24/7.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <SocialIcons variant="dark" size={13} />
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 20, paddingBottom: 8, borderBottom: '2px solid #e12454', display: 'inline-block' }}>Services</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Find Donors', 'Request Blood', 'Blood Stock', 'Appointments', 'Live Chat', 'Eligibility Check'].map((l) => (
                <li key={l}>
                  <Link href="/dashboard" className="footer-link">
                    <ChevronRight size={12} color="#e12454" /> {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 20, paddingBottom: 8, borderBottom: '2px solid #e12454', display: 'inline-block' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Phone size={14} color="#e12454" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div>+1 (454) 556-5656</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Mon–Fri, 9am–6pm</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Mail size={14} color="#e12454" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div>info@blooddonorconnect.com</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>24/7 support</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <MapPin size={14} color="#e12454" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>123 Medical Center Drive,<br />Health City, HC 10001</div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 20, paddingBottom: 8, borderBottom: '2px solid #e12454', display: 'inline-block' }}>Newsletter</h4>
            <p style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.65 }}>
              Get emergency alerts and updates delivered to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Footer bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '16px 24px', textAlign: 'center', fontSize: 12, color: '#555' }}>
          © 2026 Blood Donor Connect. All rights reserved. Built with{' '}
          <Heart size={11} style={{ display: 'inline', color: '#e12454', verticalAlign: 'middle' }} />{' '}
          to save lives.
        </div>
      </footer>
    </div>
  );
}
