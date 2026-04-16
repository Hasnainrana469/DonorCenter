'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { BLOOD_TYPES } from '@/lib/constants';
import { Sparkles, MapPin, Star, Heart, Zap, User } from 'lucide-react';
import Link from 'next/link';

interface SuggestedDonor {
  id: number;
  user: { id: number; username: string; city: string; country: string };
  blood_type: string;
  average_rating: number;
  total_donations: number;
  is_available: boolean;
  ai_score: number;
  match_reason: string;
  last_donation_date: string | null;
}

export default function AISuggestionsPage() {
  const [bloodType, setBloodType] = useState('');
  const [city, setCity] = useState('');
  const [donors, setDonors] = useState<SuggestedDonor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!bloodType) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ blood_type: bloodType });
      if (city) params.set('city', city);

      // Try to get user location for proximity scoring
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            params.set('lat', String(pos.coords.latitude));
            params.set('lng', String(pos.coords.longitude));
            const res = await api.get(`/donors/profiles/ai_suggestions/?${params}`);
            setDonors(res.data);
            setLoading(false);
          },
          async () => {
            const res = await api.get(`/donors/profiles/ai_suggestions/?${params}`);
            setDonors(res.data);
            setLoading(false);
          }
        );
      } else {
        const res = await api.get(`/donors/profiles/ai_suggestions/?${params}`);
        setDonors(res.data);
        setLoading(false);
      }
    } catch {
      setDonors([]);
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    return 'Possible Match';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={24} className="text-red-600" />
          AI Donor Suggestions
        </h1>
        <p className="text-gray-500 mt-1">
          Smart matching based on blood compatibility, availability, ratings, and proximity
        </p>
      </div>

      {/* How it works */}
      <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-100">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Zap size={16} className="text-red-600" /> How AI Scoring Works
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Blood Compatibility', desc: 'Exact match scores higher', pts: '+40 pts' },
            { label: 'Donor Rating', desc: 'Based on past feedback', pts: 'up to +25 pts' },
            { label: 'Experience', desc: 'Number of donations', pts: 'up to +15 pts' },
            { label: 'Proximity', desc: 'Closer donors score higher', pts: 'up to +20 pts' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-3">
              <p className="font-semibold text-gray-800 text-xs">{item.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              <p className="text-red-600 font-bold text-xs mt-1">{item.pts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Form */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type Needed *</label>
            <select className="input" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City (optional)</label>
            <input
              className="input"
              placeholder="e.g. Karachi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={search}
              disabled={!bloodType || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              {loading ? 'Analyzing...' : 'Find Best Matches'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      )}

      {!loading && searched && donors.length === 0 && (
        <div className="card text-center py-12">
          <Sparkles size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No matching donors found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different blood type or remove the city filter</p>
        </div>
      )}

      {!loading && donors.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            Found {donors.length} compatible donor{donors.length !== 1 ? 's' : ''} — ranked by AI score
          </p>
          {donors.map((donor, idx) => (
            <div key={donor.id} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                idx === 1 ? 'bg-gray-100 text-gray-600' :
                idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'
              }`}>
                {idx + 1}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-red-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{donor.user.username}</p>
                  <span className="w-7 h-7 blood-gradient rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {donor.blood_type}
                  </span>
                  {donor.is_available && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {donor.user.city}, {donor.user.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500" />
                    {donor.average_rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} className="text-red-400" />
                    {donor.total_donations} donations
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{donor.match_reason}</p>
              </div>

              {/* AI Score */}
              <div className={`text-center px-3 py-2 rounded-xl flex-shrink-0 ${getScoreColor(donor.ai_score)}`}>
                <p className="text-lg font-bold">{donor.ai_score}</p>
                <p className="text-xs font-medium">{getScoreLabel(donor.ai_score)}</p>
              </div>

              {/* Action */}
              <Link
                href={`/dashboard/chat?user=${donor.user.id}`}
                className="btn-primary text-sm py-2 px-4 flex-shrink-0"
              >
                Contact
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
