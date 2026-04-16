'use client';
import { useState } from 'react';
import axios from 'axios';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error' | 'exists'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/newsletter/subscribe/`,
        { email }
      );
      if (res.data.detail === 'already_subscribed') {
        setState('exists');
        setMsg(res.data.message);
      } else {
        setState('success');
        setMsg(res.data.message);
        setEmail('');
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setState('error');
      setMsg(detail || 'Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Feedback message */}
      {state !== 'idle' && state !== 'loading' && (
        <div style={{
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          background: state === 'success' ? 'rgba(34,197,94,.15)' : state === 'exists' ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.15)',
          color: state === 'success' ? '#86efac' : state === 'exists' ? '#fcd34d' : '#fca5a5',
          border: `1px solid ${state === 'success' ? 'rgba(34,197,94,.3)' : state === 'exists' ? 'rgba(245,158,11,.3)' : 'rgba(239,68,68,.3)'}`,
        }}>
          {state === 'success' ? '✅ ' : state === 'exists' ? 'ℹ️ ' : '❌ '}{msg}
        </div>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
        placeholder="Your email address"
        required
        disabled={state === 'loading' || state === 'success'}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(255,255,255,.07)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 8,
          color: '#fff',
          fontSize: 13,
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          opacity: state === 'success' ? .6 : 1,
        }}
      />

      <button
        type="submit"
        disabled={state === 'loading' || state === 'success' || !email.trim()}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 50,
          border: 'none',
          background: state === 'success' ? '#22c55e' : '#e12454',
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          cursor: state === 'loading' || state === 'success' ? 'default' : 'pointer',
          opacity: !email.trim() ? .6 : 1,
          transition: 'background .2s',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {state === 'loading' ? 'Subscribing...' : state === 'success' ? '✓ Subscribed!' : 'Subscribe'}
      </button>
    </form>
  );
}
