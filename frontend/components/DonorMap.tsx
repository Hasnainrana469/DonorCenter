'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const donorIcon = new L.DivIcon({
  html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const requestIcon = (urgency: string) => new L.DivIcon({
  html: `<div style="background:${urgency === 'critical' ? '#ef4444' : '#f97316'};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)${urgency === 'critical' ? ';animation:pulse 1s infinite' : ''}"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface Donor {
  id: number;
  user: { id: number; username: string; city: string; latitude?: number; longitude?: number };
  blood_type: string;
  is_available: boolean;
  average_rating: number;
}

interface Request {
  id: number;
  blood_type: string;
  urgency: string;
  hospital_name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  status: string;
}

interface Props {
  donors: Donor[];
  requests: Request[];
}

function AutoCenter({ donors, requests }: Props) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [
      ...donors.filter(d => d.user.latitude && d.user.longitude).map(d => [d.user.latitude!, d.user.longitude!] as [number, number]),
      ...requests.filter(r => r.latitude && r.longitude).map(r => [r.latitude!, r.longitude!] as [number, number]),
    ];
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [donors, requests, map]);
  return null;
}

export default function DonorMap({ donors, requests }: Props) {
  return (
    <MapContainer
      center={[30.0, 70.0]}
      zoom={5}
      style={{ height: '500px', borderRadius: '1rem', zIndex: 0 }}
      className="shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AutoCenter donors={donors} requests={requests} />

      {donors.map((donor) =>
        donor.user.latitude && donor.user.longitude ? (
          <Marker
            key={`donor-${donor.id}`}
            position={[donor.user.latitude, donor.user.longitude]}
            icon={donorIcon}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {donor.blood_type}
                  </span>
                  <span className="text-green-600 text-xs font-medium">● Available</span>
                </div>
                <p className="font-semibold text-gray-900">{donor.user.username}</p>
                <p className="text-gray-500 text-xs">{donor.user.city}</p>
                <p className="text-yellow-600 text-xs mt-1">★ {donor.average_rating.toFixed(1)}</p>
                <Link
                  href={`/dashboard/chat?user=${donor.user.id}`}
                  className="mt-2 block text-center bg-red-600 text-white text-xs py-1 rounded hover:bg-red-700"
                >
                  Contact Donor
                </Link>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

      {requests.map((req) =>
        req.latitude && req.longitude ? (
          <Marker
            key={`req-${req.id}`}
            position={[req.latitude, req.longitude]}
            icon={requestIcon(req.urgency)}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {req.blood_type}
                  </span>
                  <span className={`text-xs font-medium capitalize ${req.urgency === 'critical' ? 'text-red-600' : 'text-orange-500'}`}>
                    {req.urgency}
                  </span>
                </div>
                <p className="font-semibold text-gray-900">{req.hospital_name}</p>
                <p className="text-gray-500 text-xs">{req.city}</p>
                <Link
                  href={`/dashboard/requests`}
                  className="mt-2 block text-center bg-red-600 text-white text-xs py-1 rounded hover:bg-red-700"
                >
                  View Request
                </Link>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}
