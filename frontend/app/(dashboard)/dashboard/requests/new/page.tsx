'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { BLOOD_TYPES } from '@/lib/constants';

const schema = z.object({
  blood_type: z.string().min(1),
  units_needed: z.coerce.number().min(0.5),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  hospital_name: z.string().min(2),
  hospital_address: z.string().min(5),
  city: z.string().min(1),
  country: z.string().min(1),
  patient_name: z.string().min(2),
  contact_phone: z.string().min(7),
  description: z.string().optional(),
  required_by: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewRequestPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'medium', units_needed: 1 },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/requests/', data);
      router.push('/dashboard/requests');
    } catch (err) {
      console.error(err);
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Blood Request</h1>
        <p className="text-gray-500 mt-1">Fill in the details to find compatible donors</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
            <select {...register('blood_type')} className="input">
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
            {errors.blood_type && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed *</label>
            <input {...register('units_needed')} type="number" step="0.5" min="0.5" className="input" />
            {errors.units_needed && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
            <select {...register('urgency')} className="input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">🚨 Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required By</label>
            <input {...register('required_by')} type="datetime-local" className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name *</label>
          <input {...register('hospital_name')} className="input" placeholder="City General Hospital" />
          {errors.hospital_name && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Address *</label>
          <input {...register('hospital_address')} className="input" placeholder="123 Medical Ave" />
          {errors.hospital_address && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input {...register('city')} className="input" placeholder="New York" />
            {errors.city && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input {...register('country')} className="input" placeholder="USA" />
            {errors.country && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
            <input {...register('patient_name')} className="input" placeholder="John Doe" />
            {errors.patient_name && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
            <input {...register('contact_phone')} className="input" placeholder="+1234567890" />
            {errors.contact_phone && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea {...register('description')} className="input" rows={3}
            placeholder="Any additional information about the patient's condition..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
