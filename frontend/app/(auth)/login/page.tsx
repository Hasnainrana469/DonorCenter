'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import GoogleLoginButton from '@/components/GoogleLoginButton';

const schema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const TEST_ACCOUNTS = [
  { label: 'Donor',   username: 'donor_ahmed',    password: 'Test1234!' },
  { label: 'Patient', username: 'darkdominion.x', password: 'Test1234!' },
  { label: 'Admin',   username: 'Admin',           password: 'Test1234!' },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError]               = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [showTestAccounts, setShowTest] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.post('/auth/login/', data);
      setAuth(res.data.user, res.data.access, res.data.refresh);
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string | string[]> } };
      const errData = e.response?.data;
      if (errData) {
        const msgs = Object.values(errData).flat().join(' ');
        setError(msgs || 'Login failed. Please try again.');
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    }
  };

  const fillTest = (acc: typeof TEST_ACCOUNTS[0]) => {
    setValue('username', acc.username);
    setValue('password', acc.password);
    setShowTest(false);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 mb-6">Sign in with your username or email</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
          <input
            {...register('username')}
            className="input"
            placeholder="Enter username or email"
            autoComplete="username"
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>

        {/* Password with show/hide */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#ebebeb' }} />
        <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: '#ebebeb' }} />
      </div>

      {/* Google Login */}
      <GoogleLoginButton
        role="patient"
        onError={(msg) => setError(msg)}
      />

      {/* Quick test accounts */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowTest(!showTestAccounts)}
          className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
        >
          {showTestAccounts ? '▲ Hide' : '▼ Quick login with test account'}
        </button>
        {showTestAccounts && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillTest(acc)}
                className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg py-2 px-2 text-gray-600 transition-colors"
              >
                {acc.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-red-600 font-semibold hover:underline">Register</Link>
      </p>

      {/* ── Admin Login ── */}
      <div style={{
        marginTop: 20, paddingTop: 16,
        borderTop: '1px dashed #ebebeb',
        textAlign: 'center',
      }}>
        <Link
          href="/login"
          onClick={() => {
            setValue('username', 'Admin');
            setValue('password', 'Test1234!');
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 20px', borderRadius: 50,
            background: '#1a1a2e', color: '#fff',
            fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
            transition: 'background .2s, box-shadow .2s',
            boxShadow: '0 2px 10px rgba(26,26,46,.25)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#0f3460';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(26,26,46,.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#1a1a2e';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 10px rgba(26,26,46,.25)';
          }}
        >
          <ShieldCheck size={15} />
          Login as Admin
        </Link>
        <p style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
          For platform administrators only
        </p>
      </div>
    </>
  );
}
