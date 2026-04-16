'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { BLOOD_TYPES } from '@/lib/constants';
import { MapPin, Droplets, Users } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const DonorMap = dynamic(() => import('@/components/DonorMap'), { ssr: false, loading: () => (
  <div className="h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
    <div className="text-center">
      <MapPin size={32} className="text-gray-400 mx-auto mb-2 animate-bounce" />
      <p className="text-gray-500">Loading map...</p>
    </div>
  </div>
)});

interface MapDonor {
  id: number;
  user: { id: number; username: string; city: string; latitude?: number; longitude?: number };
  blood_type: string;
  is_available: boolean;
  average_rating: number;
}

interface MapRequest {
  id: number;
  blood_type: string;
  urgency: string;
  hospital_name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  status: string;
}

export default function MapPage() {
  const [donors, setDonors] = useState<MapDonor[]>([]);
  const [requests, setRequests] = useState<MapRequest[]>([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [showDonors, setShowDonors] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (bloodTypeFilter) params.set('blood_type', bloodTypeFilter);

        const [donorRes, reqRes] = await Promise.all([
          api.get(`/donors/profiles/?${params}&is_available=true`),
          api.get(`/requests/?${params}&status=open`),
        ]);
        setDonors(donorRes.data.results || donorRes.data);
        setRequests(reqRes.data.results || reqRes.data);
      } catch {
        setDonors([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bloodTypeFilter]);

  const donorsWithCoords = donors.filter(d => d.user.latitude && d.user.longitude);
  const requestsWithCoords = requests.filter(r => r.latitude && r.longitude);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={24} className="text-red-600" />
          Live Donor Map
        </h1>
        <p className="text-gray-500 mt-1">Real-time locations of available donors and active blood requests</p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <select
            className="input w-40"
            value={bloodTypeFilter}
            onChange={(e) => setBloodTypeFilter(e.target.value)}
          >
            <option value="">All Blood Types</option>
            {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDonors}
              onChange={(e) => setShowDonors(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded"
            />
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              Donors ({donorsWithCoords.length})
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRequests}
              onChange={(e) => setShowRequests(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              Requests ({requestsWithCoords.length})
            </span>
          </label>

          <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={14} /> {donorsWithCoords.length} donors on map
            </span>
            <span className="flex items-center gap-1">
              <Droplets size={14} /> {requestsWithCoords.length} requests on map
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <MapPin size={32} className="text-gray-400 mx-auto mb-2 animate-bounce" />
            <p className="text-gray-500">Loading data...</p>
          </div>
        </div>
      ) : (
        <DonorMap
          donors={showDonors ? donorsWithCoords : []}
          requests={showRequests ? requestsWithCoords : []}
        />
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Map Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow" />
            <span className="text-gray-600">Available Donor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow" />
            <span className="text-gray-600">Open Blood Request</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow animate-pulse" />
            <span className="text-gray-600">Critical Request</span>
          </div>
        </div>
        {donorsWithCoords.length === 0 && requestsWithCoords.length === 0 && (
          <p className="text-sm text-gray-400 mt-3">
            No location data available. Donors and patients need to set their coordinates in their profile.
          </p>
        )}
      </div>
    </div>
  );
}
