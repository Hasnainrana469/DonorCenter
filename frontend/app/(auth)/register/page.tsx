'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Check, X, ChevronDown, Search } from 'lucide-react';
import api from '@/lib/api';
import { LANGUAGES } from '@/lib/constants';
import GoogleLoginButton from '@/components/GoogleLoginButton';

// ── Pakistani cities ──
const PK_CITIES = [
  'Abbottabad','Bahawalpur','Faisalabad','Gujranwala','Gujrat','Hyderabad',
  'Islamabad','Karachi','Lahore','Larkana','Mardan','Multan','Muzaffarabad',
  'Nawabshah','Okara','Peshawar','Quetta','Rawalpindi','Sargodha','Sialkot',
  'Sukkur','Wah Cantonment',
].sort();

// ── World countries ──
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belgium','Bolivia','Bosnia and Herzegovina','Brazil',
  'Bulgaria','Cambodia','Canada','Chile','China','Colombia','Croatia','Cuba',
  'Czech Republic','Denmark','Ecuador','Egypt','Ethiopia','Finland','France',
  'Germany','Ghana','Greece','Guatemala','Hungary','India','Indonesia','Iran',
  'Iraq','Ireland','Israel','Italy','Japan','Jordan','Kazakhstan','Kenya',
  'Kuwait','Lebanon','Libya','Malaysia','Mexico','Morocco','Myanmar','Nepal',
  'Netherlands','New Zealand','Nigeria','Norway','Oman','Pakistan','Palestine',
  'Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia',
  'Senegal','Serbia','Singapore','Somalia','South Africa','South Korea','Spain',
  'Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand',
  'Tunisia','Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zimbabwe',
].sort();

// ── Zod schema ──
const noNumbers = (field: string) =>
  z.string()
    .optional()
    .refine((v) => !v || !/\d/.test(v), { message: `${field} cannot contain numbers` });

const schema = z.object({
  username:         z.string().min(3, 'Min 3 characters').refine((v) => !/\d/.test(v), 'Username cannot contain numbers'),
  email:            z.string().email('Invalid email').refine((v) => v.endsWith('@gmail.com'), 'Please use a valid Gmail address (@gmail.com)'),
  phone:            z.string()
                      .regex(/^03\d{9}$/, 'Enter a valid Pakistani number starting with 03 (11 digits)'),
  password:         z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
  role:             z.enum(['donor', 'patient']),
  city:             noNumbers('City'),
  country:          z.string().min(1, 'Country is required').refine((v) => !/\d/.test(v), 'Country cannot contain numbers'),
  language:         z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

// ── Searchable dropdown ──
function SearchableDropdown({
  options, value, onChange, placeholder, error,
}: {
  options: string[]; value: string; onChange: (v: string) => void;
  placeholder: string; error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`input flex items-center justify-between text-left ${error ? 'border-red-400' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <span style={{ color: value ? 'var(--text)' : '#aaa' }}>{value || placeholder}</span>
        <ChevronDown size={14} style={{ color: '#aaa', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)', marginTop: 4,
          maxHeight: 220, display: 'flex', flexDirection: 'column',
          animation: 'slideDown .18s ease',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  width: '100%', padding: '6px 8px 6px 26px',
                  border: '1px solid #ebebeb', borderRadius: 7,
                  fontSize: 13, outline: 'none',
                }}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '10px 14px', fontSize: 13, color: '#aaa' }}>No results</div>
            ) : filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); setQuery(''); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 14px', fontSize: 13,
                  background: opt === value ? '#fde8ee' : 'transparent',
                  color: opt === value ? '#e12454' : 'var(--text)',
                  border: 'none', cursor: 'pointer',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f9'; }}
                onMouseLeave={(e) => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Password field with show/hide ──
function PasswordField({
  label, name, register: reg, error, watch, confirmOf,
}: {
  label: string; name: string;
  register: ReturnType<typeof useForm<FormData>>['register'];
  error?: string; watch?: string; confirmOf?: string;
}) {
  const [show, setShow] = useState(false);
  const match = confirmOf !== undefined && watch !== undefined
    ? watch === confirmOf && watch.length > 0
    : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          {...reg(name as keyof FormData)}
          type={show ? 'text' : 'password'}
          className="input"
          placeholder="••••••••"
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        {match !== null && watch && watch.length > 0 && (
          <span style={{
            position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)',
          }}>
            {match
              ? <Check size={15} style={{ color: '#22c55e' }} />
              : <X size={15} style={{ color: '#ef4444' }} />}
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cityValue, setCityValue] = useState('');
  const [countryValue, setCountryValue] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient', language: 'en', city: '', country: '' },
  });

  const pwVal = watch('password');
  const cpVal = watch('confirm_password');

  // Block numbers in text fields on keydown
  const blockNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (/\d/.test(e.key)) e.preventDefault();
  };

  // Block non-numeric & enforce 03 prefix for phone
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    setValue('phone', raw, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await api.post('/auth/register/', data);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msgs = Object.values(e.response?.data || {}).flat().join(' ');
      setError(msgs || 'Registration failed.');
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Registration Successful!</h2>
        <p className="text-gray-600 mt-2">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Username + Role */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              {...register('username')}
              className="input"
              placeholder="johndoe"
              onKeyDown={blockNumbers}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select {...register('role')} className="input">
              <option value="patient">Patient</option>
              <option value="donor">Donor</option>
            </select>
          </div>
        </div>

        {/* Email — Gmail only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email')} type="email" className="input" placeholder="john@gmail.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone — Pakistani format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            {...register('phone')}
            className="input"
            placeholder="03001234567"
            inputMode="numeric"
            maxLength={11}
            onChange={handlePhone}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* City + Country — searchable dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-gray-400 text-xs">(optional)</span></label>
            <SearchableDropdown
              options={PK_CITIES}
              value={cityValue}
              onChange={(v) => { setCityValue(v); setValue('city', v, { shouldValidate: true }); }}
              placeholder="Select city"
              error={errors.city?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <SearchableDropdown
              options={COUNTRIES}
              value={countryValue}
              onChange={(v) => { setCountryValue(v); setValue('country', v, { shouldValidate: true }); }}
              placeholder="Select country"
              error={errors.country?.message}
            />
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select {...register('language')} className="input">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Password with show/hide + match indicator */}
        <PasswordField
          label="Password"
          name="password"
          register={register}
          error={errors.password?.message}
        />
        <PasswordField
          label="Confirm Password"
          name="confirm_password"
          register={register}
          error={errors.confirm_password?.message}
          watch={cpVal}
          confirmOf={pwVal}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-red-600 font-semibold hover:underline">Sign In</Link>
      </p>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#ebebeb' }} />
        <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>or sign up with</span>
        <div style={{ flex: 1, height: 1, background: '#ebebeb' }} />
      </div>

      {/* Google Register */}
      <GoogleLoginButton
        role="patient"
        onError={(msg) => setError(msg)}
      />
    </>
  );
}
