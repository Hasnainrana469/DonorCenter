'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Appointment } from '@/lib/types';
import { Calendar, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

const schema = z.object({
  hospital_name: z.string().min(2),
  hospital_address: z.string().min(5),
  scheduled_date: z.string().min(1),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/');
      setAppointments(res.data.results || res.data);
    } catch {
      setAppointments([]);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/appointments/', data);
      reset();
      setShowForm(false);
      fetchAppointments();
    } catch {
      alert('Failed to book appointment.');
    }
  };

  const cancelAppointment = async (id: number) => {
    await api.patch(`/appointments/${id}/`, { status: 'cancelled' });
    fetchAppointments();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Book Appointment
        </button>
      </div>

      {showForm && (
        <div className="card border-red-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">New Appointment</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                <input {...register('hospital_name')} className="input" placeholder="City Hospital" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input {...register('scheduled_date')} type="datetime-local" className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Address</label>
              <input {...register('hospital_address')} className="input" placeholder="123 Medical Ave" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea {...register('notes')} className="input" rows={2} placeholder="Any special notes..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="card flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                <p className="text-xs text-red-600 font-medium">
                  {format(new Date(apt.scheduled_date), 'MMM')}
                </p>
                <p className="text-xl font-bold text-red-600">
                  {format(new Date(apt.scheduled_date), 'd')}
                </p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{apt.hospital_name}</p>
                <p className="text-sm text-gray-500">{apt.hospital_address}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(apt.scheduled_date), 'PPp')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[apt.status]}`}>{apt.status}</span>
                {apt.status === 'scheduled' && (
                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
