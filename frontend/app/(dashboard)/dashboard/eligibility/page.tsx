'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { ShieldCheck, ShieldX } from 'lucide-react';

const schema = z.object({
  age: z.coerce.number().min(1).max(120),
  weight: z.coerce.number().min(1),
  last_donation_date: z.string().optional(),
  has_chronic_disease: z.boolean(),
  is_pregnant: z.boolean(),
  recent_surgery: z.boolean(),
  recent_tattoo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Result {
  is_eligible: boolean;
  reason: string;
}

export default function EligibilityPage() {
  const [result, setResult] = useState<Result | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      has_chronic_disease: false,
      is_pregnant: false,
      recent_surgery: false,
      recent_tattoo: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/donors/eligibility-check/', data);
      setResult(res.data);
    } catch {
      alert('Failed to check eligibility.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Eligibility Checker</h1>
        <p className="text-gray-500 mt-1">Find out if you&apos;re eligible to donate blood</p>
      </div>

      {result && (
        <div className={`card border-2 ${result.is_eligible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-4">
            {result.is_eligible
              ? <ShieldCheck size={40} className="text-green-600" />
              : <ShieldX size={40} className="text-red-600" />
            }
            <div>
              <h2 className={`text-xl font-bold ${result.is_eligible ? 'text-green-700' : 'text-red-700'}`}>
                {result.is_eligible ? 'You are eligible to donate!' : 'Not eligible at this time'}
              </h2>
              <p className={`text-sm mt-1 ${result.is_eligible ? 'text-green-600' : 'text-red-600'}`}>
                {result.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
            <input {...register('age')} type="number" className="input" placeholder="25" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
            <input {...register('weight')} type="number" step="0.1" className="input" placeholder="70" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation Date</label>
          <input {...register('last_donation_date')} type="date" className="input" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Health Conditions</p>
          {[
            { name: 'has_chronic_disease' as const, label: 'I have a chronic disease (diabetes, heart disease, etc.)' },
            { name: 'is_pregnant' as const, label: 'I am currently pregnant' },
            { name: 'recent_surgery' as const, label: 'I had surgery in the last 6 months' },
            { name: 'recent_tattoo' as const, label: 'I got a tattoo in the last 6 months' },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer">
              <input {...register(name)} type="checkbox" className="w-4 h-4 text-red-600 rounded" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Checking...' : 'Check Eligibility'}
        </button>
      </form>
    </div>
  );
}
