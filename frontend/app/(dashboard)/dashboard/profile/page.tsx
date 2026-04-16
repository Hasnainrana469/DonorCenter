'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { LANGUAGES } from '@/lib/constants';
import { User, Shield, Phone } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [otpSent, setOtpSent] = useState(false);
  const [otpType, setOtpType] = useState<'phone' | 'email'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      city: user?.city || '',
      country: user?.country || '',
      language: user?.language || 'en',
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    try {
      const res = await api.patch('/auth/profile/', data);
      updateUser(res.data);
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Failed to update profile.');
    }
  };

  const sendOTP = async (type: 'phone' | 'email') => {
    setOtpType(type);
    await api.post('/auth/send-otp/', { otp_type: type });
    setOtpSent(true);
    setMessage(`OTP sent to your ${type}`);
  };

  const verifyOTP = async () => {
    try {
      await api.post('/auth/verify-otp/', { code: otpCode, otp_type: otpType });
      updateUser({ [`is_${otpType}_verified`]: true } as Record<string, boolean>);
      setMessage(`${otpType} verified successfully!`);
      setOtpSent(false);
      setOtpCode('');
    } catch {
      setMessage('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
          {message}
        </div>
      )}

      {/* Profile Info */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
            <p className="text-gray-500 capitalize">{user?.role}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input {...register('city')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input {...register('country')} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select {...register('language')} className="input">
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Verification */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-red-600" />
          Account Verification
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone Verification</p>
                <p className="text-xs text-gray-500">{user?.phone || 'Not set'}</p>
              </div>
            </div>
            {user?.is_phone_verified ? (
              <span className="badge bg-green-100 text-green-800">✓ Verified</span>
            ) : (
              <button onClick={() => sendOTP('phone')} className="btn-primary text-xs py-1.5 px-3">
                Verify
              </button>
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Verification</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            {user?.is_email_verified ? (
              <span className="badge bg-green-100 text-green-800">✓ Verified</span>
            ) : (
              <button onClick={() => sendOTP('email')} className="btn-primary text-xs py-1.5 px-3">
                Verify
              </button>
            )}
          </div>
        </div>

        {otpSent && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-3">Enter the OTP sent to your {otpType}</p>
            <div className="flex gap-3">
              <input
                className="input flex-1"
                placeholder="6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
              />
              <button onClick={verifyOTP} className="btn-primary px-4">Verify</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
