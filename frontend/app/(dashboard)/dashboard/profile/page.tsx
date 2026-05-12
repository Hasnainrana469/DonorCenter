'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { LANGUAGES } from '@/lib/constants';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      city:     user?.city     || '',
      country:  user?.country  || '',
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

      {/* Account Details — verification buttons removed */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User size={18} className="text-red-600" />
          Account Details
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-xs text-gray-500">{user?.phone || 'Not set'}</p>
            </div>
            {user?.is_phone_verified && (
              <span className="badge bg-green-100 text-green-800">✓ Verified</span>
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            {user?.is_email_verified && (
              <span className="badge bg-green-100 text-green-800">✓ Verified</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
