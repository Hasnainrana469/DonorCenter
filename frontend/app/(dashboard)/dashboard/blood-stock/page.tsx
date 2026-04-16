'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BloodBank } from '@/lib/types';
import { BLOOD_TYPES, STOCK_STATUS_COLORS } from '@/lib/constants';
import { Building2, Phone } from 'lucide-react';

export default function BloodStockPage() {
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cityFilter) params.set('city', cityFilter);
        const res = await api.get(`/blood-stock/banks/?${params}`);
        setBanks(res.data.results || res.data);
      } catch {
        setBanks([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [cityFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blood Stock Management</h1>
        <p className="text-gray-500 mt-1">Real-time blood availability across blood banks</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <input className="input" placeholder="Filter by city..." value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)} />
          <select className="input" value={bloodTypeFilter}
            onChange={(e) => setBloodTypeFilter(e.target.value)}>
            <option value="">All Blood Types</option>
            {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>
      </div>

      {/* Blood Type Summary */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Quick Availability Overview</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {BLOOD_TYPES.map((bt) => {
            const totalUnits = banks.flatMap(b => b.stocks)
              .filter(s => s.blood_type === bt)
              .reduce((sum, s) => sum + (s.units_free || 0), 0);
            const status = totalUnits === 0 ? 'critical' : totalUnits < 10 ? 'low' : totalUnits < 30 ? 'moderate' : 'adequate';
            return (
              <div key={bt} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 blood-gradient rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                  {bt}
                </div>
                <p className={`text-sm font-bold ${STOCK_STATUS_COLORS[status]}`}>{totalUnits}</p>
                <p className="text-xs text-gray-400">units</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blood Banks */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-48" />)}
        </div>
      ) : banks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No blood banks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banks.map((bank) => (
            <div key={bank.id} className="card">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{bank.name}</h3>
                  <p className="text-sm text-gray-500">{bank.city}, {bank.country}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Phone size={11} />{bank.phone}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {bank.stocks
                  .filter(s => !bloodTypeFilter || s.blood_type === bloodTypeFilter)
                  .map((stock) => (
                    <div key={stock.id} className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs font-bold text-gray-700">{stock.blood_type}</p>
                      <p className={`text-sm font-bold ${STOCK_STATUS_COLORS[stock.status]}`}>
                        {stock.units_free}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{stock.status}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
