'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { BLOOD_TYPES } from '@/lib/constants';

const schema = z.object({
  blood_type: z.string().min(1, 'Required'),
  weight: z.coerce.number().min(30),
  age: z.coerce.number().min(18).max(65),
  is_available: z.boolean(),
  last_donation_date: z.string().optional(),
  medical_conditions: z.string().optional(),
  emergency_contact: z.string().optional(),
  bio: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DonorRegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_available: true },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/donors/profiles/', data);
      router.push('/dashboard/donors');
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msgs = Object.values(e.response?.data || {}).flat().join(' ');
      alert(msgs || 'Failed to register as donor.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register as Donor</h1>
        <p className="text-gray-500 mt-1">Help save lives by registering your blood donation profile</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
            <select {...register('blood_type')} className="input">
              <option value="">Select</option>
              {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
            {errors.blood_type && <p className="text-red-500 text-xs mt-1">{errors.blood_type.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
            <input {...register('age')} type="number" className="input" placeholder="25" />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
            <input {...register('weight')} type="number" step="0.1" className="input" placeholder="70" />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation Date</label>
          <input {...register('last_donation_date')} type="date" className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input {...register('emergency_contact')} className="input" placeholder="+1234567890" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
          <textarea {...register('medical_conditions')} className="input" rows={2}
            placeholder="Any relevant medical conditions (leave blank if none)" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea {...register('bio')} className="input" rows={3}
            placeholder="Tell patients a bit about yourself and your donation experience..." />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input {...register('is_available')} type="checkbox" className="w-4 h-4 text-red-600 rounded" />
          <span className="text-sm font-medium text-gray-700">I am currently available to donate</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Registering...' : 'Register as Donor'}
          </button>
        </div>
      </form>
    </div>
  );
}
