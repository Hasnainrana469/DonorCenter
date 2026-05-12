'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { BLOOD_TYPES } from '@/lib/constants';

// Pakistani hospital names — sorted alphabetically
const PK_HOSPITALS = [
  'Aga Khan University Hospital, Karachi',
  'Allied Hospital, Faisalabad',
  'Benazir Bhutto Hospital, Rawalpindi',
  'Children Hospital, Lahore',
  'Civil Hospital, Karachi',
  'Combined Military Hospital (CMH), Lahore',
  'Combined Military Hospital (CMH), Rawalpindi',
  'DHQ Hospital, Gujranwala',
  'DHQ Hospital, Multan',
  'Fatima Memorial Hospital, Lahore',
  'Gulab Devi Hospital, Lahore',
  'Hayatabad Medical Complex, Peshawar',
  'Holy Family Hospital, Rawalpindi',
  'Indus Hospital, Karachi',
  'Jinnah Hospital, Karachi',
  'Jinnah Hospital, Lahore',
  'Khyber Teaching Hospital, Peshawar',
  'Lady Reading Hospital, Peshawar',
  'Liaquat National Hospital, Karachi',
  'Liaquat University Hospital, Hyderabad',
  'Mayo Hospital, Lahore',
  'Nishtar Hospital, Multan',
  'Pakistan Institute of Medical Sciences (PIMS), Islamabad',
  'Patel Hospital, Karachi',
  'Polyclinic Hospital, Islamabad',
  'Punjab Institute of Cardiology, Lahore',
  'Quaid-e-Azam International Hospital, Islamabad',
  'Services Hospital, Lahore',
  'Shaukat Khanum Memorial Cancer Hospital, Lahore',
  'Shaukat Khanum Memorial Cancer Hospital, Peshawar',
  'Sheikh Zayed Hospital, Lahore',
  'South City Hospital, Karachi',
  'Ziauddin Hospital, Karachi',
].sort();

const schema = z.object({
  blood_type:         z.string().min(1, 'Required'),
  weight:             z.coerce.number({ invalid_type_error: 'Weight must be a number' })
                        .positive('Weight must be positive')
                        .min(30, 'Minimum weight is 30 kg')
                        .max(300, 'Maximum weight is 300 kg'),
  age:                z.coerce.number({ invalid_type_error: 'Age must be a number' })
                        .int('Age must be a whole number')
                        .min(18, 'Minimum age is 18')
                        .max(120, 'Age cannot exceed 120 years'),
  is_available:       z.boolean(),
  last_donation_date: z.string().optional(),
  hospital_name:      z.string().optional(),
  medical_conditions: z.string().optional(),
  emergency_contact:  z.string().optional(),
  bio:                z.string().optional(),
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

  // Block letters and minus from numeric fields
  const blockNonNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[\d.]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };
  const blockMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-') e.preventDefault();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register as Donor</h1>
        <p className="text-gray-500 mt-1">Help save lives by registering your blood donation profile</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {/* Blood Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
            <select {...register('blood_type')} className="input">
              <option value="">Select</option>
              {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
            {errors.blood_type && <p className="text-red-500 text-xs mt-1">{errors.blood_type.message}</p>}
          </div>

          {/* Age — max 120 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
            <input
              {...register('age')}
              type="number"
              className="input"
              placeholder="25"
              min={18}
              max={120}
              onKeyDown={(e) => { blockNonNumeric(e); blockMinus(e); }}
              onInput={(e) => {
                const el = e.currentTarget;
                if (Number(el.value) > 120) el.value = '120';
                if (Number(el.value) < 0) el.value = '';
              }}
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
          </div>

          {/* Weight — no letters, no minus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
            <input
              {...register('weight')}
              type="number"
              step="0.1"
              className="input"
              placeholder="70"
              min={30}
              onKeyDown={(e) => { blockNonNumeric(e); blockMinus(e); }}
              onInput={(e) => {
                const el = e.currentTarget;
                if (Number(el.value) < 0) el.value = '';
              }}
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
          </div>
        </div>

        {/* Hospital Name — Pakistani hospitals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Hospital</label>
          <select {...register('hospital_name')} className="input">
            <option value="">Select a hospital (optional)</option>
            {PK_HOSPITALS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation Date</label>
          <input {...register('last_donation_date')} type="date" className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input {...register('emergency_contact')} className="input" placeholder="+92 300 0000000" />
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
