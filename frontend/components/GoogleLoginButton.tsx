'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
    handleGoogleCredential?: (response: { credential: string }) => void;
  }
}

interface Props {
  role?: 'donor' | 'patient';
  onError?: (msg: string) => void;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function GoogleLoginButton({ role = 'patient', onError }: Props) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const btnRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const handleCredential = async (response: { credential: string }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google/', {
        id_token: response.credential,
        role,
      });
      setAuth(res.data.user, res.data.access, res.data.refresh);
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      const msg = e.response?.data?.error || 'Google sign-in failed. Please try again.';
      onError?.(msg);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!CLIENT_ID) return;

    // Expose callback globally so GSI can call it
    window.handleGoogleCredential = handleCredential;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: window.handleGoogleCredential!,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
      setReady(true);
    };

    // If script already loaded
    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    // Load script if not present
    if (!document.getElementById('google-gsi')) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      // Script tag exists but may still be loading
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (!CLIENT_ID) return null;

  return (
    <div style={{ width: '100%' }}>
      {/* Google's rendered button (hidden while loading) */}
      <div
        ref={btnRef}
        style={{ width: '100%', minHeight: 44, display: ready && !loading ? 'block' : 'none' }}
      />

      {/* Fallback clickable button shown until GSI renders */}
      {(!ready || loading) && (
        <button
          type="button"
          disabled={loading}
          onClick={() => window.google?.accounts?.id?.prompt()}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '11px 16px',
            border: '1.5px solid #dadce0',
            borderRadius: 4,
            background: '#fff',
            cursor: loading ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 500,
            color: '#3c4043',
            fontFamily: 'Inter, sans-serif',
            transition: 'box-shadow .2s, background .2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
          }}
        >
          {loading ? (
            <>
              <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#dadce0" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              {/* Google G logo */}
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
